(function () {
// ? END - struct.js

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

//* Globals because this thing is just unsafe everywhere.
let output = [];
let indexVertex = 0;
let indexUvs = 0;
let indexNormalx = 0;

const vertex = new THREE.Vector3();
const normal = new THREE.Vector3();
const uv = new THREE.Vector2();
const face = [];

// A way to encode strings to utf8. (uint8)
// Convert string literals to uint8[] (Uint8Array).
const encoder = new TextEncoder();

class WorkerContainer {
  
  // MEGA resizeable buffer.
  buffer = new ArrayBuffer(0, {
    // ~128 MB limit. A HUGE MODEL!
    maxByteLength: 1000 * 1000 * 128
  })

  // A nice view of the buffer. Brings additional features.
  view = new DataView(this.buffer)

  grow(bytes) {
    this.buffer.resize(this.buffer.byteLength + bytes)
  }

  //* Disabled in case I accidentally call it, this is JS after all.
  // reset() {
  //   this.buffer.resize(0)
  // }

  appendFloat(floatingPointNumber) {

  }

  appendChar(charUint8) {
    this.grow(1)
    this.view.setUint8(this.buffer.byteLength - 1, charUint8)
  }

  appendString(string) {
    const encodedStringArray = encoder.encode(string)
    encodedStringArray.forEach((char) => {
      this.appendChar(char)
    })
  }

}

let binContainers = {
  textureCoordinates: new WorkerContainer()
}

function exportIt() {
  //todo: Eventually, only export selected things as an option.

  

  binContainers.textureCoordinates.appendString("Hello there");


  // print(view.byteLength)
  // print("new bytelength: " + view.byteLength)

  Blockbench.writeFile("/home/jordan/.minetest/games/forgotten-lands/mods/minecart/models/minecart.b3d", {
    content: binContainers.textureCoordinates.buffer
  })







  // Version number.
  // tempBuffer = writeInt(tempBuffer, 1)
  // tempBuffer = writeString(tempBuffer, "BB3D")

  // Have to iterate the scene multiple times because of the way B3D functions.
  // for (const [meshPart,] of Object.entries(IdentifierMeshParts)) {
  //   print("Parsing: " + meshPart)
  //   scene.traverse(function(child){
  //     switch (meshPart) {
  //       case IdentifierMeshParts.TextureCoordinates: {
  //         // print("Doing texture things")
  //         if (child instanceof THREE.Mesh) {
  //           parseTextureCoordinates(child, meshPart);
  //         }
  //         break;
  //       }
  //       // case 
  //     }
  //   })
  // }
  
  // const blah = new Uint8Array.from([1,23,4,5,6,7])
  // print(blah)
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




Plugin.register("minetest_b3d", {
  title: "Minetest B3D Exporter.",
  author: "jordan4ibanez",
  icon: "icon-objects",
  description: "Export models into Minetest using B3D.",
  tags: ["minetest", "b3d", "export"],
  version: "0.0.1",
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