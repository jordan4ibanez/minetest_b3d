(function () {

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
  
  getCurrent(byteSize) {
    return this.buffer.byteLength - byteSize
  }

  grow(bytes) {
    this.buffer.resize(this.buffer.byteLength + bytes)
  }

  //* Disabled in case I accidentally call it, this is JS after all.
  // reset() {
  //   this.buffer.resize(0)
  // }

  appendHeader(name, numberOfElements) {
    this.appendString(name)
    this.appendInt32(numberOfElements)
  }

  appendQuaternion(x,y,z,w) {
    // W is actually first but don't tell anyone.
    this.appendFloat(w)
    this.appendFloat(x)
    this.appendFloat(y)
    this.appendFloat(z)
  }
  
  appendVec2(x,y) {
    this.appendFloat(x)
    this.appendFloat(y)
  }

  appendVec3(x,y,z) {
    this.appendFloat(x)
    this.appendFloat(y)
    this.appendFloat(z)
  }

  appendFloat(float) {
    const sizeInBytes = 4
    this.grow(sizeInBytes)
    this.view.setFloat32(this.getCurrent(sizeInBytes), float, true)
  }

  appendInt32(int32) {
    const sizeInBytes = 4
    this.grow(sizeInBytes)
    this.view.setInt32(this.getCurrent(sizeInBytes), int32, true)
  }

  appendInt8(int8) {
    const sizeInBytes = 1
    this.grow(sizeInBytes)
    this.view.setInt8(this.getCurrent(sizeInBytes), int8, true)
  }

  appendChar(charInt8) {
    this.appendInt8(charInt8)
  }

  appendString(string) {
    const encodedStringArray = encoder.encode(string)
    for (const char of encodedStringArray) {
      print("char: " + char)
      this.appendChar(char)      
    }
    // encodedStringArray.forEach((char) => {
    //   this.appendChar(char)
    // })
  }

}

let binContainers = {
  textureCoordinates: new WorkerContainer()
}

function exportIt() {
  //todo: Eventually, only export selected things as an option.

  
  //! Here we are trying to make a triangle.

  // Using texcoords as a prototyping container.
  const buffer = binContainers.textureCoordinates

  //? A hardcoded cube for debugging/prototyping.

  // Header.
  // buffer.appendString("BB3D")

  // B3D Version 1.
  buffer.appendInt32(100)


  //! Texture information.

  // Header & number of elements.
  // buffer.appendHeader("TEXS", 0)

  // // Texture name(s).
  // buffer.appendString("test.png")

  // // Texture flag 1. (What even is this?)
  // buffer.appendInt32(1)

  // // Texture flag 2. (blend)
  // buffer.appendInt32(2)

  // // Position. X, Y
  // buffer.appendVec2(0,0)

  // // Scale. X, Y
  // buffer.appendVec2(1,1)

  // // Rotation, in radians.
  // buffer.appendFloat(0)


  //! Brushes. (WTF is brushes??)

  // Header & number of elements.
  // buffer.appendHeader("BRUS", 0)

  //! Nodes.

  // Header.
  // buffer.appendString("ye")

  // Position. Vec3.
  // buffer.appendVec3(0,0,0)

  // Scale. Vec3.
  // buffer.appendVec3(1,1,1)

  // Rotation. Quaternion.
  // buffer.appendQuaternion(0,0,0,1)

  //! Mesh.

//   // Header & number of elements.
//   buffer.appendHeader("MESH", 1)

//   // Brush ID.
//   buffer.appendInt32(-1)


//   //! Vertices.

//   // Header & number of elements.
//   buffer.appendHeader("VRTS", 1)

//   // Texture coordinate sets per vertex. Will always be 1 because blockbench doesn't do advanced blender features. (I think?)
//   buffer.appendInt32(1)

//   // Components (x,y,z) per set. Will always be 2 because blockbench models are simple texture maps. So (x,y).
//   buffer.appendInt32(2)

//   // So this is an array. So I'll just document it in the order it appears.

//   // Positions. XYZ
//   // Normals. We'll go with -Z. XYZ
//   // Texture coordinates.

// //{
//   buffer.appendVec3(-1,-1,0) // position
//   buffer.appendVec3(0,0,-1)  // normal
//   buffer.appendVec3(0,1)     // texture coordinate

//   buffer.appendVec3(1,-1,0)  // position
//   buffer.appendVec3(0,0,-1)  // normal
//   buffer.appendVec3(1,1)     // texture coordinate

//   buffer.appendVec3(0,1,0)   // position
//   buffer.appendVec3(0,0,-1)  // normal
//   buffer.appendVec3(0.5,0)   // texture coordinate
//}

  //! Tris. (vertex index winding [aka indices])

  // Header & number of elements.
  // buffer.appendHeader("TRIS", 1)

//   // Brush ID. -1 is disabled basically.
//   buffer.appendInt32(-1)

//   // Indices.
// //{
//   buffer.appendInt32(0)
//   buffer.appendInt32(1)
//   buffer.appendInt32(2)
//}



  // print(view.byteLength)
  // print("new bytelength: " + view.byteLength)

  const testing = new WorkerContainer()

  testing.appendString("BB3D");

  testing.appendInt32(buffer.buffer.byteLength);

  for (const byte of new Uint8Array(buffer.buffer)) {
    testing.appendInt8(byte)
  }

  Blockbench.writeFile("/home/jordan/.minetest/games/forgotten-lands/mods/minecart/models/minecart.b3d", {
    content: testing.buffer
  })

  print("exported minecart.")




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