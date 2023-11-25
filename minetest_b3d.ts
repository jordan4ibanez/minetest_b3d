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

class Element {
  byteSize = 0
  addBytes(byteSize: number) {
    this.byteSize += byteSize
  }
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

class B3d extends Element{
  byteSize: number = (1 * 4)
  version: number = 1
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
  brush: number = -1
  
}

class MeshElement extends Element {

}

function exportIt() {
  //todo: Eventually, only export selected things as an option.

  
  //! Here we are trying to make a triangle.




  // Blockbench.writeFile("/home/jordan/.minetest/games/forgotten-lands/mods/minecart/models/minecart.b3d", {
  //   content: finalizedModel.buffer
  // })

  print("exported minecart.")

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