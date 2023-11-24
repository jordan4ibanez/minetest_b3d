(function () {

// ? BEGIN - struct.js
/**
 * I did not make this.
 * Attributes: https://github.com/lyngklip/structjs
 * License: MIT
 */
/*eslint-env es6*/
const rechk = /^([<>])?(([1-9]\d*)?([xcbB?hHiIfdsp]))*$/
const refmt = /([1-9]\d*)?([xcbB?hHiIfdsp])/g
const str = (v,o,c) => String.fromCharCode(
    ...new Uint8Array(v.buffer, v.byteOffset + o, c))
const rts = (v,o,c,s) => new Uint8Array(v.buffer, v.byteOffset + o, c)
    .set(s.split('').map(str => str.charCodeAt(0)))
const pst = (v,o,c) => str(v, o + 1, Math.min(v.getUint8(o), c - 1))
const tsp = (v,o,c,s) => { v.setUint8(o, s.length); rts(v, o + 1, c - 1, s) }
const lut = le => ({
    x: c=>[1,c,0],
    c: c=>[c,1,o=>({u:v=>str(v, o, 1)      , p:(v,c)=>rts(v, o, 1, c)     })],
    '?': c=>[c,1,o=>({u:v=>Boolean(v.getUint8(o)),p:(v,B)=>v.setUint8(o,B)})],
    b: c=>[c,1,o=>({u:v=>v.getInt8(   o   ), p:(v,b)=>v.setInt8(   o,b   )})],
    B: c=>[c,1,o=>({u:v=>v.getUint8(  o   ), p:(v,B)=>v.setUint8(  o,B   )})],
    h: c=>[c,2,o=>({u:v=>v.getInt16(  o,le), p:(v,h)=>v.setInt16(  o,h,le)})],
    H: c=>[c,2,o=>({u:v=>v.getUint16( o,le), p:(v,H)=>v.setUint16( o,H,le)})],
    i: c=>[c,4,o=>({u:v=>v.getInt32(  o,le), p:(v,i)=>v.setInt32(  o,i,le)})],
    I: c=>[c,4,o=>({u:v=>v.getUint32( o,le), p:(v,I)=>v.setUint32( o,I,le)})],
    f: c=>[c,4,o=>({u:v=>v.getFloat32(o,le), p:(v,f)=>v.setFloat32(o,f,le)})],
    d: c=>[c,8,o=>({u:v=>v.getFloat64(o,le), p:(v,d)=>v.setFloat64(o,d,le)})],
    s: c=>[1,c,o=>({u:v=>str(v,o,c), p:(v,s)=>rts(v,o,c,s.slice(0,c    ) )})],
    p: c=>[1,c,o=>({u:v=>pst(v,o,c), p:(v,s)=>tsp(v,o,c,s.slice(0,c - 1) )})]
})
const errbuf = new RangeError("Structure larger than remaining buffer")
const errval = new RangeError("Not enough values for structure")
function struct(format) {
    let fns = [], size = 0, m = rechk.exec(format)
    if (!m) { throw new RangeError("Invalid format string") }
    const t = lut('<' === m[1]), lu = (n, c) => t[c](n ? parseInt(n, 10) : 1)
    while ((m = refmt.exec(format))) { ((r, s, f) => {
        for (let i = 0; i < r; ++i, size += s) { if (f) {fns.push(f(size))} }
    })(...lu(...m.slice(1)))}
    const unpack_from = (arrb, offs) => {
        if (arrb.byteLength < (offs|0) + size) { throw errbuf }
        let v = new DataView(arrb, offs|0)
        return fns.map(f => f.u(v))
    }
    const pack_into = (arrb, offs, ...values) => {
        if (values.length < fns.length) { throw errval }
        if (arrb.byteLength < offs + size) { throw errbuf }
        const v = new DataView(arrb, offs)
        new Uint8Array(arrb, offs, size).fill(0)
        fns.forEach((f, i) => f.p(v, values[i]))
    }
    const pack = (...values) => {
        let b = new ArrayBuffer(size)
        pack_into(b, 0, ...values)
        return b
    }
    const unpack = arrb => unpack_from(arrb, 0)
    function* iter_unpack(arrb) { 
        for (let offs = 0; offs + size <= arrb.byteLength; offs += size) {
            yield unpack_from(arrb, offs);
        }
    }
    return Object.freeze({
        unpack, pack, unpack_from, pack_into, iter_unpack, format, size})
}
/*
const pack = (format, ...values) => struct(format).pack(...values)
const unpack = (format, buffer) => struct(format).unpack(buffer)
const pack_into = (format, arrb, offs, ...values) =>
    struct(format).pack_into(arrb, offs, ...values)
const unpack_from = (format, arrb, offset) =>
    struct(format).unpack_from(arrb, offset)
const iter_unpack = (format, arrb) => struct(format).iter_unpack(arrb)
const calcsize = format => struct(format).size
module.exports = {
    struct, pack, unpack, pack_into, unpack_from, iter_unpack, calcsize }
*/

// ? END - struct.js

var button;
const print = console.log;

/**
 * Can only pass ArrayBuffers with uint8 encoding into this.
 */
function addToBuffer(buffer, newRawData) {
  const currentLengthIndex = buffer.byteLength;
  const dataWidth = newRawData.byteLength;
  const temp = new Uint8Array(buffer.byteLength + dataWidth)
  // Copy over the old buffer
  for (let i = 0; i < buffer.byteLength; i++) {
    temp[i] = buffer[i];
  }
  // New values.
  for (let i = 0; i < dataWidth; i++) {
    temp[currentLengthIndex + i] = newRawData[i];
  }
  return temp;
}

function writeInt(buffer, value) {
  const s = struct("<i");
  const newRawData = new Uint8Array(s.pack(value));
  return addToBuffer(buffer, newRawData);
}

function writeFloat(buffer, value) {
  const s = struct("<f");
  const newRawData = new Uint8Array(s.pack(value));
  return addToBuffer(buffer, newRawData);
}

function writeFloatCouple(buffer, value1, value2) {
  const s = struct("<ff");
  const newRawData = new Uint8Array(s.pack(value1, value2));
  return addToBuffer(buffer, newRawData);
}

function writeFloatTriplet(buffer, value1, value2, value3) {
  const s = struct("<fff");
  const newRawData = new Uint8Array(s.pack(value1, value2, value3));
  return addToBuffer(buffer, newRawData);
}

function writeQuad(buffer, value1, value2, value3, value4) {
  const s = struct("<ffff")
  const newRawData = new Uint8Array(s.pack(value1, value2, value3, value4))
  return addToBuffer(buffer, newRawData)
}

function writeString(buffer, value) {
  const binaryFormat = "<" + (value.length + 1) + "s"
  const s = struct(binaryFormat)
  const newRawData = new Uint8Array(s.pack(encodeURI(value)))
  return addToBuffer(buffer, newRawData)
}

function writeChunk(name, value) {
  let dummy = Uint8Array()
  return dummy + name + writeInt(value.length) + value
}


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

let tempBuffer = new Uint8Array()

let buffers = {
  
}

function exportIt() {
  //todo: Eventually, only export selected things as an option.

  // tempBuffer = new Uint8Array();

  // MEGA resizeable buffer.
  const buffer = new ArrayBuffer(0, {
    // ~256 MB limit. A HUGE MODEL!
    maxByteLength: 4 * 1024 * 1024 * 4
  });

  // A nice view.
  const view = new DataView(buffer);

  // A way to encode strings to utf8. (uint8)
  const encoder = new TextEncoder();


  print("is view? :" + ArrayBuffer.isView(view));
  print("is resizeable? " + view.resizable);

  print(view.byteLength)

  //todo: This can be turned into pure functional via extension functions. like add 1 byte when uint8 adding etc
  
  // print("view length: " + view.byteLength);
  // print("view offset: " + view.byteOffset);

  // print(view)

  // view.setUint8(0, 1)

  // print(view)

  const encArray = encoder.encode("hello there")

  encArray.forEach((number) => {
    // view.resize(view.byteLength + 1)
    view.buffer.resize(view.buffer.byteLength + 1)
    view.setUint8(view.buffer.byteLength - 1, number)
  })

  print(view.byteLength)
  // print("new bytelength: " + view.byteLength)

  Blockbench.writeFile("/home/jordan/.minetest/games/forgotten-lands/mods/minecart/models/minecart.b3d", {
    content: buffer
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