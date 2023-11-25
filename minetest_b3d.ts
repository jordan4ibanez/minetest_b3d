(function () {

// This is basically the TS equivalent of adding local in front of everything in lua.

var button;
const print = console.log;


const IdentifierMeshParts = {
  Positions: "positions",
  TextureCoordinates: "textureCoordinates",
  Nodes: "nodes",
}

const cube_face_normals = {
  north: [ 0,  0, -1],
  east:  [ 1,  0,  0],
  south: [ 0,  0,  1],
  west:  [-1,  0,  0],
  up:    [ 0,  1,  0],
  down:  [ 0, -1,  0],
}

// A way to encode strings to utf8. (uint8)
  // Convert string literals to uint8[] (Uint8Array).
const encoder = new TextEncoder();

// Makes this more readable
const Byte    = 1
const Char    = 1
const Integer = 4
const Float   = 4

// Special class to ensure it is known that it's integral.
function Ivec3(x: number, y: number, z: number) {
  return new IntegerVec3(x,y,z)
}
class IntegerVec3 {
  x: number = 0
  y: number = 0
  z: number = 0
  constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }
}

function FVec2(x: number, y: number) {
  return new Vec2(x,y)
}
class Vec2 {
  byteSize = Float * 2
  x: number = 0
  y: number = 0
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

function FVec3(x: number, y: number, z: number) {
  return new Vec3(x,y,z)
}
class Vec3 extends Vec2 {
  byteSize: number = Float * 3
  z: number = 0
  constructor(x: number, y: number, z: number) {
    super(x,y)
    this.z = z
  }
}

class Quaternion extends Vec3 {
  byteSize: number = Float * 4
  w: number = 0
  constructor(x: number, y: number, z: number, w: number) {
    super(x,y,z)
    this.w = w
  }
}

class Element {
  byteSize = 0
  addBytes(byteSize: number) {
    this.byteSize += byteSize
  }
}

// Master container class.
class B3d extends Element {
  byteSize: number = (1 * 4)
  version: number = 1
  rootNode: Node = null
  addRootNode(node: Node) {
    this.addBytes(node.byteSize)
    this.rootNode = node
  }
}

class Node extends Element {
  byteSize: number = (3 * 3 * 4) * Float
  readonly name: string
  position: Vec3 = new Vec3(0,0,0)
  scale: Vec3 = new Vec3(1,1,1)
  rotation: Quaternion = new Quaternion(0,0,0,1)

  // Allow rapidly indexing through the tree.
  parent: Node = null
  children: Array<Node | NodeElement> = []

  constructor(name: string) {
    super()
    this.name = name
    this.addBytes(name.length * Char)
  }

  setParent(node: Node) {
    this.parent = node
    this.parent.addBytes(this.byteSize)
    // Recurse through the tree to add all bytes.
    if (this.parent.parent) {
      this.parent.parent.addBytes(this.byteSize)
    }
  }

  addChild(nodeOrElement: Node | NodeElement) {
    this.children.push(nodeOrElement)
  }
}

// Specific classification to filter objects that Node can hold.
class NodeElement extends Element {

}

class Mesh extends NodeElement {
  byteSize: number = Integer * 1
  readonly brush: number = -1
  vrts: Verts = null
  tris: Tris = null

  setVerts(newVert: Verts) {
    if (this.vrts !== null) {
      throw new Error("Cannot reassign vrts into a Mesh!")
    }
    this.addBytes(newVert.byteSize)
    this.vrts = newVert
  }
  setTris(newTris: Tris) {
    if (this.tris !== null) {
      throw new Error("Cannot reassign tris into a Mesh!")
    }
    this.addBytes(newTris.byteSize)
    this.tris = newTris
  }
}

class Verts extends Element {
  byteSize: number = Integer + Integer + (Integer * 2)
  readonly flags = 1
  readonly textureCoordinateSets = 1
  readonly textureCoordinateSetSize = 2

  // Builder pattern || direct construction.

  data: Array<VertexElement> = []

  addVertex(element: VertexElement) {
    this.addBytes(element.byteSize)
    this.data.push(element)
  }
  constructor(vertexList?: Array<VertexElement>) {
    super()
    if (vertexList) {
      vertexList.forEach((vert: VertexElement) => {
        this.addVertex(vert)
      })
    }
  }
}

interface VertexElementDefinition {
  position: Vec3
  normal: Vec3
  textureCoordinates: Vec2
}

function VertElm(def: VertexElementDefinition) {
  return new VertexElement(def)
}
class VertexElement extends Element {
  readonly byteSize: number = (Float * 3) + (Float * 3) + (Float * 2)
  readonly position: Vec3;
  readonly normal: Vec3;
  readonly textureCoordinates: Vec2;

  constructor(def: VertexElementDefinition) {
    super()
    this.position = def.position
    this.normal = def.normal
    this.textureCoordinates = def.textureCoordinates
  }
}

class Tris extends Element {
  byteSize: number = Integer
  readonly brushID = -1
  triWindings: Array<IntegerVec3> = []

  // Builder pattern || direct construction.

  addTri(newTri: IntegerVec3) {
    this.addBytes(Integer * 3)
    this.triWindings.push(newTri)
    print("new bytesize in tri: " + this.byteSize)
  }

  constructor(windingList?: Array<IntegerVec3>) {
    super()
    if (windingList) {
      windingList.forEach((winding: Vec3) => {
        this.addTri(winding)
      })
    }
  }
}


function exportIt() {
  //todo: Eventually, only export selected things as an option.
  //! Here we are trying to make a triangle.

  const masterContainer = new B3d()

  const rootNode = new Node("root_node");

  const triangleVertices = new Verts([
    VertElm({
      position: FVec3(-1,0,0),
      normal: FVec3(0,0,1),
      textureCoordinates: FVec2(0,0)
    }),
    VertElm({
      position: FVec3(1,0,0),
      normal: FVec3(0,0,1),
      textureCoordinates: FVec2(1,0)
    }),
    VertElm({
      position: FVec3(0,1,0),
      normal: FVec3(0,0,1),
      textureCoordinates: FVec2(0.5,1)
    }),
  ])

  const triangleTris = new Tris([
    Ivec3(0,1,2)
  ])

  const coolMesh = new Mesh()
  coolMesh.setVerts(triangleVertices)
  coolMesh.setTris(triangleTris)

  rootNode.addChild(coolMesh)

  masterContainer.addRootNode(rootNode)

  print("omega size: " + masterContainer.byteSize)



  // Blockbench.writeFile("/home/jordan/.minetest/games/forgotten-lands/mods/minecart/models/minecart.b3d", {
  //   content: finalizedModel.buffer
  // })

  print("exported minecart. (this is a lie)")

}

function parseMesh(mesh) {
  console.log("--------------------------------")

  // * export modes go here.

  const geometry = mesh.geometry;
  const element = OutlinerNode.uuids[mesh.name];

  if (!element) return;
  if (element.export === false) return;

  const normalMatrixWorld = new THREE.Matrix3();

  normalMatrixWorld.getNormalMatrix(mesh.matrixWorld);

  if (element instanceof Cube) {
    print(" that's a cube all right")
  }
}

function parseTextureCoordinates(mesh) {

}


BBPlugin.register("minetest_b3d", {
  title: "Minetest B3D Exporter.",
  author: "jordan4ibanez",
  icon: "icon-objects",
  description: "Export models into Minetest using B3D.",
  tags: ["minetest", "b3d", "export"],
  // version: "0.0.1",
  variant: 'both',
  onload() {
    button = new Action('export_b3d', {
      name: 'Export B3D Model',
      description: 'Export model as B3D for minetest.',
      icon: 'icon-objects',
      click: function () {
        exportIt();
      }
    });

    MenuBar.addAction(button, 'file.export.0');
  },
  onunload() {
    button.delete();
  }
})

})();