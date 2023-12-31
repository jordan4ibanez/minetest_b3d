(function () {

// This is basically the TS equivalent of adding local in front of everything in lua.

var button: Action;
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
const HEADER_WIDTH = (Char * 4)
const BYTE_COUNT_WIDTH = Integer

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

//! BEGIN ARRAYBUFFER UTILITY.

class BufferContainer {
    
  index: number = 0
  buffer: ArrayBuffer
  view: DataView
  
  constructor(byteLength: number) {
    this.buffer = new ArrayBuffer(byteLength)
    // A nice view of the buffer. Brings additional features.
    this.view = new DataView(this.buffer)
  }

  // Didn't even know you could make methods private in TS.
  #debugIndexing() {
    // print(`index: ${this.index} | maxIndex: ${this.buffer.byteLength}`)
  }


  appendHeader(name: string, containerByteSize: number) {
    this.appendString(name)
    this.appendInt32(containerByteSize)
  }


  appendQuaternion(quat: Quaternion) {
    // W is actually first but don't tell anyone.
    this.appendFloat(quat.w)
    this.appendFloat(quat.x)
    this.appendFloat(quat.y)
    this.appendFloat(quat.z)
  }

  appendQuaternionLiteral(x: number, y: number, z: number, w: number) {
    // W is actually first but don't tell anyone.
    this.appendFloat(w)
    this.appendFloat(x)
    this.appendFloat(y)
    this.appendFloat(z)
  }

  appendIVec2Literal(x: number, y: number) {
    this.appendInt32(x)
    this.appendInt32(y)
  }

  appendIvec3(vec: IntegerVec3) {
    this.appendInt32(vec.x)
    this.appendInt32(vec.y)
    this.appendInt32(vec.z)
  }
  appendIVec3Literal(x: number, y: number, z: number) {
    this.appendInt32(x)
    this.appendInt32(y)
    this.appendInt32(z)
  }
  
  appendVec2(vec: Vec2) {
    this.appendFloat(vec.x)
    this.appendFloat(vec.y)
  }

  appendVector2(x: number, y: number) {
    this.appendFloat(x)
    this.appendFloat(y)
  }

  appendVec3(vec: Vec3) {
    this.appendFloat(vec.x)
    this.appendFloat(vec.y)
    this.appendFloat(vec.z)
  }

  appendVector3(x: number, y: number, z: number) {
    this.appendFloat(x)
    this.appendFloat(y)
    this.appendFloat(z)
  }

  appendFloat(float: number) {
    this.#debugIndexing()
    this.view.setFloat32(this.index, float, true)
    this.index += Float
  }
  
  appendInt32(int32: number) {
    this.#debugIndexing()
    this.view.setInt32(this.index, int32, true)
    this.index += Integer
  }

  appendInt8(int8: number) {
    this.#debugIndexing()
    this.view.setInt8(this.index, int8)
    this.index += Byte
  }

  appendChar(charInt8: number) {
    this.appendInt8(charInt8)
  }

  appendString(string: string) {
    const encodedStringArray: Uint8Array = encoder.encode(string)
    encodedStringArray.forEach((char: number) => {
      this.appendChar(char)
    })
  }

}


//! BEGIN B3D.

class Element {
  header: string
  // Bytesize is the size of the array it holds.
  byteSize = 0
  // Literal bytesize is the total size of this element. ALL ITEMS. Yes, even the header and byteSize elements!
  literalByteSize = 0
  addBytes(byteSize: number) {
    this.byteSize += byteSize
  }
  addLiteralBytes(byteSize: number) {
    this.literalByteSize += byteSize
  }
}

// Master container class.
class B3d extends Element {
  readonly header: string = "BB3D"
  
  // Plus integer because this includes the size of the version number.
  byteSize: number = Integer
  literalByteSize: number = HEADER_WIDTH + BYTE_COUNT_WIDTH + Integer + 1

  version: number = 1
  rootNode: Node = null
  addRootNode(node: Node) {
    if (this.rootNode !== null) {
      throw new Error("Cannot set the root note on a B3d container more than once!")
    }
    this.addBytes(node.byteSize)
    this.addLiteralBytes(node.literalByteSize)
    this.rootNode = node
  }
}

class Node extends Element {
  readonly header: string = "NODE"

  byteSize: number = (3 + 3 + 4) * Float
  literalByteSize: number = this.byteSize + HEADER_WIDTH + BYTE_COUNT_WIDTH

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
    this.addLiteralBytes(name.length * Char)
  }

  setParent(node: Node) {
    this.parent = node
    // ! fixme: re-enable this
    // this.parent.addBytes(this.byteSize + HEADER_WIDTH)
    // Recurse through the tree to add all bytes.
    // if (this.parent.parent) {
    //   this.parent.parent.addBytes(this.byteSize + HEADER_WIDTH)
    // }
  }

  addChild(nodeOrElement: Node | NodeElement) {
    this.addBytes(nodeOrElement.byteSize)
    this.addLiteralBytes(nodeOrElement.literalByteSize)
    this.children.push(nodeOrElement)
  }
}

// Specific classification to filter objects that Node can hold.
class NodeElement extends Element {

}

class Mesh extends NodeElement {
  readonly header: string = "MESH"
  byteSize: number = Integer
  literalByteSize: number = this.byteSize + HEADER_WIDTH + BYTE_COUNT_WIDTH

  readonly brush: number = -1
  vrts: Verts = null
  tris: Tris = null

  setVerts(newVert: Verts) {
    if (this.vrts !== null) {
      throw new Error("Cannot reassign vrts into a Mesh!")
    }
    this.addBytes(newVert.byteSize)
    this.addLiteralBytes(newVert.literalByteSize)
    this.vrts = newVert
  }
  setTris(newTris: Tris) {
    if (this.tris !== null) {
      throw new Error("Cannot reassign tris into a Mesh!")
    }
    this.addBytes(newTris.byteSize)
    this.addLiteralBytes(newTris.literalByteSize)
    this.tris = newTris
  }
}

class Verts extends Element {
  readonly header: string = "VRTS"
  byteSize: number = Integer * 3
  literalByteSize: number = this.byteSize + HEADER_WIDTH + BYTE_COUNT_WIDTH
  readonly flags = 1
  readonly textureCoordinateSets = 1
  readonly textureCoordinateSetSize = 2

  // Builder pattern || direct construction.

  data: Array<VertexElement> = []

  addVertex(element: VertexElement) {
    this.addBytes(element.byteSize)
    this.addLiteralBytes(element.literalByteSize)
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
  readonly byteSize: number = (3 + 3 + 2) * Float
  readonly literalByteSize: number = this.byteSize
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
  readonly header: string = "TRIS"
  byteSize: number = Integer + Integer
  literalByteSize: number = this.byteSize + HEADER_WIDTH + BYTE_COUNT_WIDTH
  arrayByteSize: number = 0
  readonly brushID = -1
  triWindings: Array<IntegerVec3> = []

  // Builder pattern || direct construction.

  addTri(newTri: IntegerVec3) {
    this.addBytes(Integer * 3)
    this.addLiteralBytes(Integer * 3)
    this.triWindings.push(newTri)
    this.arrayByteSize += (Integer * 3)
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

//! BEGIN IMPLEMENTATION.

function finalize(container: B3d): ArrayBuffer {

  // A hardcode for now!

  const buffer = new BufferContainer(container.literalByteSize)
  
  buffer.appendString(container.header)
  buffer.appendInt32(container.byteSize)
  print("literal bytesize: " + container.byteSize)
  buffer.appendInt32(container.version)

  const rootNode = container.rootNode

  if (rootNode) {
    print("byte size literal of root node: " + rootNode.literalByteSize)
    buffer.appendString(rootNode.header)
    buffer.appendInt32(rootNode.byteSize)
    buffer.appendString(rootNode.name)
    buffer.appendVec3(rootNode.position)
    buffer.appendVec3(rootNode.scale)
    buffer.appendQuaternion(rootNode.rotation)

    const meshElement = rootNode.children[0]

    if (meshElement) {
      if (meshElement instanceof Mesh) {

        buffer.appendString(meshElement.header)
        buffer.appendInt32(meshElement.byteSize)
        buffer.appendInt32(meshElement.brush)

        
        const vrts = meshElement.vrts
        if (vrts) {
          buffer.appendString(vrts.header)
          buffer.appendInt32(vrts.byteSize)
          buffer.appendInt32(vrts.flags)
          buffer.appendInt32(vrts.textureCoordinateSets)
          buffer.appendInt32(vrts.textureCoordinateSetSize)

          vrts.data.forEach((v: VertexElement) => {
            buffer.appendVec3(v.position)
            buffer.appendVec3(v.normal)
            buffer.appendVec2(v.textureCoordinates)
          })
        }

        const tris = meshElement.tris

        if (tris) {
          buffer.appendString(tris.header)
          buffer.appendInt32(tris.byteSize)
          buffer.appendInt32(tris.brushID)
          tris.triWindings.forEach((triangle: IntegerVec3) => {
            buffer.appendIvec3(triangle)
          })
        }
      }
    }
  }

  buffer.appendString("\0")

  print("final index: " + buffer.index)

  return buffer.buffer
}


function exportIt() {
  //todo: Eventually, only export selected things as an option.
  //! Here we are trying to make a triangle.

  const masterContainer = new B3d()

  const rootNode = new Node("ROOT");

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
  // coolMesh.setTris(triangleTris)

  rootNode.addChild(coolMesh)

  masterContainer.addRootNode(rootNode)

  const finishedBuffer: ArrayBuffer = finalize(masterContainer)
  
  print("actual size: " + finishedBuffer.byteLength)


  //const output = "/home/jordan/Desktop/testingMesh.b3d"
  const output = "/home/jordan/.minetest/games/forgotten-lands/mods/minecart/models/minecart.b3d"
  Blockbench.writeFile(output, {
    content: finishedBuffer
  })

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