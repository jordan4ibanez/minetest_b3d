var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
(function () {
    // This is basically the TS equivalent of adding local in front of everything in lua.
    var _BufferContainer_instances, _BufferContainer_debugIndexing;
    var button;
    const print = console.log;
    const IdentifierMeshParts = {
        Positions: "positions",
        TextureCoordinates: "textureCoordinates",
        Nodes: "nodes",
    };
    const cube_face_normals = {
        north: [0, 0, -1],
        east: [1, 0, 0],
        south: [0, 0, 1],
        west: [-1, 0, 0],
        up: [0, 1, 0],
        down: [0, -1, 0],
    };
    // A way to encode strings to utf8. (uint8)
    // Convert string literals to uint8[] (Uint8Array).
    const encoder = new TextEncoder();
    // Makes this more readable
    const Byte = 1;
    const Char = 1;
    const Integer = 4;
    const Float = 4;
    const HEADER_WIDTH = (Char * 4);
    const BYTE_COUNT_WIDTH = Integer;
    // Special class to ensure it is known that it's integral.
    function Ivec3(x, y, z) {
        return new IntegerVec3(x, y, z);
    }
    class IntegerVec3 {
        constructor(x, y, z) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }
    function FVec2(x, y) {
        return new Vec2(x, y);
    }
    class Vec2 {
        constructor(x, y) {
            this.byteSize = Float * 2;
            this.x = 0;
            this.y = 0;
            this.x = x;
            this.y = y;
        }
    }
    function FVec3(x, y, z) {
        return new Vec3(x, y, z);
    }
    class Vec3 extends Vec2 {
        constructor(x, y, z) {
            super(x, y);
            this.byteSize = Float * 3;
            this.z = 0;
            this.z = z;
        }
    }
    class Quaternion extends Vec3 {
        constructor(x, y, z, w) {
            super(x, y, z);
            this.byteSize = Float * 4;
            this.w = 0;
            this.w = w;
        }
    }
    //! BEGIN ARRAYBUFFER UTILITY.
    class BufferContainer {
        constructor(byteLength) {
            _BufferContainer_instances.add(this);
            this.index = 0;
            this.buffer = new ArrayBuffer(byteLength);
            // A nice view of the buffer. Brings additional features.
            this.view = new DataView(this.buffer);
        }
        appendHeader(name, containerByteSize) {
            this.appendString(name);
            this.appendInt32(containerByteSize);
        }
        appendQuaternion(quat) {
            // W is actually first but don't tell anyone.
            this.appendFloat(quat.w);
            this.appendFloat(quat.x);
            this.appendFloat(quat.y);
            this.appendFloat(quat.z);
        }
        appendQuaternionLiteral(x, y, z, w) {
            // W is actually first but don't tell anyone.
            this.appendFloat(w);
            this.appendFloat(x);
            this.appendFloat(y);
            this.appendFloat(z);
        }
        appendIVec2Literal(x, y) {
            this.appendInt32(x);
            this.appendInt32(y);
        }
        appendIvec3(vec) {
            this.appendInt32(vec.x);
            this.appendInt32(vec.y);
            this.appendInt32(vec.z);
        }
        appendIVec3Literal(x, y, z) {
            this.appendInt32(x);
            this.appendInt32(y);
            this.appendInt32(z);
        }
        appendVec2(vec) {
            this.appendFloat(vec.x);
            this.appendFloat(vec.y);
        }
        appendVector2(x, y) {
            this.appendFloat(x);
            this.appendFloat(y);
        }
        appendVec3(vec) {
            this.appendFloat(vec.x);
            this.appendFloat(vec.y);
            this.appendFloat(vec.z);
        }
        appendVector3(x, y, z) {
            this.appendFloat(x);
            this.appendFloat(y);
            this.appendFloat(z);
        }
        appendFloat(float) {
            __classPrivateFieldGet(this, _BufferContainer_instances, "m", _BufferContainer_debugIndexing).call(this);
            this.view.setFloat32(this.index, float, true);
            this.index += Float;
        }
        appendInt32(int32) {
            __classPrivateFieldGet(this, _BufferContainer_instances, "m", _BufferContainer_debugIndexing).call(this);
            this.view.setInt32(this.index, int32, true);
            this.index += Integer;
        }
        appendInt8(int8) {
            __classPrivateFieldGet(this, _BufferContainer_instances, "m", _BufferContainer_debugIndexing).call(this);
            this.view.setInt8(this.index, int8);
            this.index += Byte;
        }
        appendChar(charInt8) {
            this.appendInt8(charInt8);
        }
        appendString(string) {
            const encodedStringArray = encoder.encode(string);
            encodedStringArray.forEach((char) => {
                this.appendChar(char);
            });
        }
    }
    _BufferContainer_instances = new WeakSet(), _BufferContainer_debugIndexing = function _BufferContainer_debugIndexing() {
        // print(`index: ${this.index} | maxIndex: ${this.buffer.byteLength}`)
    };
    //! BEGIN B3D.
    class Element {
        constructor() {
            // Bytesize is the size of the array it holds.
            this.byteSize = 0;
            // Literal bytesize is the total size of this element. ALL ITEMS. Yes, even the header and byteSize elements!
            this.literalByteSize = 0;
        }
        addBytes(byteSize) {
            this.byteSize += byteSize;
        }
        addLiteralBytes(byteSize) {
            this.literalByteSize += byteSize;
        }
    }
    // Master container class.
    class B3d extends Element {
        constructor() {
            super(...arguments);
            this.header = "BB3D";
            // Plus integer because this includes the size of the version number.
            this.byteSize = Integer;
            this.literalByteSize = HEADER_WIDTH + BYTE_COUNT_WIDTH + Integer + 1;
            this.version = 1;
            this.rootNode = null;
        }
        addRootNode(node) {
            if (this.rootNode !== null) {
                throw new Error("Cannot set the root note on a B3d container more than once!");
            }
            this.addBytes(node.byteSize);
            this.addLiteralBytes(node.literalByteSize);
            this.rootNode = node;
        }
    }
    class Node extends Element {
        constructor(name) {
            super();
            this.header = "NODE";
            this.byteSize = (3 + 3 + 4) * Float;
            this.literalByteSize = this.byteSize + HEADER_WIDTH + BYTE_COUNT_WIDTH;
            this.position = new Vec3(0, 0, 0);
            this.scale = new Vec3(1, 1, 1);
            this.rotation = new Quaternion(0, 0, 0, 1);
            // Allow rapidly indexing through the tree.
            this.parent = null;
            this.children = [];
            this.name = name;
            this.addBytes(name.length * Char);
            this.addLiteralBytes(name.length * Char);
        }
        setParent(node) {
            this.parent = node;
            // ! fixme: re-enable this
            // this.parent.addBytes(this.byteSize + HEADER_WIDTH)
            // Recurse through the tree to add all bytes.
            // if (this.parent.parent) {
            //   this.parent.parent.addBytes(this.byteSize + HEADER_WIDTH)
            // }
        }
        addChild(nodeOrElement) {
            this.addBytes(nodeOrElement.byteSize);
            this.addLiteralBytes(nodeOrElement.literalByteSize);
            this.children.push(nodeOrElement);
        }
    }
    // Specific classification to filter objects that Node can hold.
    class NodeElement extends Element {
    }
    class Mesh extends NodeElement {
        constructor() {
            super(...arguments);
            this.header = "MESH";
            this.byteSize = Integer;
            this.literalByteSize = this.byteSize + HEADER_WIDTH + BYTE_COUNT_WIDTH;
            this.brush = -1;
            this.vrts = null;
            this.tris = null;
        }
        setVerts(newVert) {
            if (this.vrts !== null) {
                throw new Error("Cannot reassign vrts into a Mesh!");
            }
            this.addBytes(newVert.byteSize);
            this.addLiteralBytes(newVert.literalByteSize);
            this.vrts = newVert;
        }
        setTris(newTris) {
            if (this.tris !== null) {
                throw new Error("Cannot reassign tris into a Mesh!");
            }
            this.addBytes(newTris.byteSize);
            this.addLiteralBytes(newTris.literalByteSize);
            this.tris = newTris;
        }
    }
    class Verts extends Element {
        addVertex(element) {
            this.addBytes(element.byteSize);
            this.addLiteralBytes(element.literalByteSize);
            this.data.push(element);
        }
        constructor(vertexList) {
            super();
            this.header = "VRTS";
            this.byteSize = Integer * 3;
            this.literalByteSize = this.byteSize + HEADER_WIDTH + BYTE_COUNT_WIDTH;
            this.flags = 1;
            this.textureCoordinateSets = 1;
            this.textureCoordinateSetSize = 2;
            // Builder pattern || direct construction.
            this.data = [];
            if (vertexList) {
                vertexList.forEach((vert) => {
                    this.addVertex(vert);
                });
            }
        }
    }
    function VertElm(def) {
        return new VertexElement(def);
    }
    class VertexElement extends Element {
        constructor(def) {
            super();
            this.byteSize = (3 + 3 + 2) * Float;
            this.literalByteSize = this.byteSize;
            this.position = def.position;
            this.normal = def.normal;
            this.textureCoordinates = def.textureCoordinates;
        }
    }
    class Tris extends Element {
        // Builder pattern || direct construction.
        addTri(newTri) {
            this.addBytes(Integer * 3);
            this.addLiteralBytes(Integer * 3);
            this.triWindings.push(newTri);
            this.arrayByteSize += (Integer * 3);
        }
        constructor(windingList) {
            super();
            this.header = "TRIS";
            this.byteSize = Integer + Integer;
            this.literalByteSize = this.byteSize + HEADER_WIDTH + BYTE_COUNT_WIDTH;
            this.arrayByteSize = 0;
            this.brushID = -1;
            this.triWindings = [];
            if (windingList) {
                windingList.forEach((winding) => {
                    this.addTri(winding);
                });
            }
        }
    }
    //! BEGIN IMPLEMENTATION.
    function finalize(container) {
        // A hardcode for now!
        const buffer = new BufferContainer(container.literalByteSize);
        buffer.appendString(container.header);
        buffer.appendInt32(container.byteSize);
        print("literal bytesize: " + container.byteSize);
        buffer.appendInt32(container.version);
        const rootNode = container.rootNode;
        if (rootNode) {
            print("byte size literal of root node: " + rootNode.literalByteSize);
            buffer.appendString(rootNode.header);
            buffer.appendInt32(rootNode.byteSize);
            buffer.appendString(rootNode.name);
            buffer.appendVec3(rootNode.position);
            buffer.appendVec3(rootNode.scale);
            buffer.appendQuaternion(rootNode.rotation);
            const meshElement = rootNode.children[0];
            if (meshElement) {
                if (meshElement instanceof Mesh) {
                    buffer.appendString(meshElement.header);
                    buffer.appendInt32(meshElement.byteSize);
                    buffer.appendInt32(meshElement.brush);
                    const vrts = meshElement.vrts;
                    if (vrts) {
                        buffer.appendString(vrts.header);
                        buffer.appendInt32(vrts.byteSize);
                        buffer.appendInt32(vrts.flags);
                        buffer.appendInt32(vrts.textureCoordinateSets);
                        buffer.appendInt32(vrts.textureCoordinateSetSize);
                        vrts.data.forEach((v) => {
                            buffer.appendVec3(v.position);
                            buffer.appendVec3(v.normal);
                            buffer.appendVec2(v.textureCoordinates);
                        });
                    }
                    const tris = meshElement.tris;
                    if (tris) {
                        buffer.appendString(tris.header);
                        buffer.appendInt32(tris.byteSize);
                        buffer.appendInt32(tris.brushID);
                        tris.triWindings.forEach((triangle) => {
                            buffer.appendIvec3(triangle);
                        });
                    }
                }
            }
        }
        buffer.appendString("\0");
        print("final index: " + buffer.index);
        return buffer.buffer;
    }
    function exportIt() {
        //todo: Eventually, only export selected things as an option.
        //! Here we are trying to make a triangle.
        const masterContainer = new B3d();
        const rootNode = new Node("ROOT");
        const triangleVertices = new Verts([
            VertElm({
                position: FVec3(-1, 0, 0),
                normal: FVec3(0, 0, 1),
                textureCoordinates: FVec2(0, 0)
            }),
            VertElm({
                position: FVec3(1, 0, 0),
                normal: FVec3(0, 0, 1),
                textureCoordinates: FVec2(1, 0)
            }),
            VertElm({
                position: FVec3(0, 1, 0),
                normal: FVec3(0, 0, 1),
                textureCoordinates: FVec2(0.5, 1)
            }),
        ]);
        const triangleTris = new Tris([
            Ivec3(0, 1, 2)
        ]);
        const coolMesh = new Mesh();
        coolMesh.setVerts(triangleVertices);
        // coolMesh.setTris(triangleTris)
        rootNode.addChild(coolMesh);
        masterContainer.addRootNode(rootNode);
        const finishedBuffer = finalize(masterContainer);
        print("actual size: " + finishedBuffer.byteLength);
        //const output = "/home/jordan/Desktop/testingMesh.b3d"
        const output = "/home/jordan/.minetest/games/forgotten-lands/mods/minecart/models/minecart.b3d";
        Blockbench.writeFile(output, {
            content: finishedBuffer
        });
        print("exported minecart. (this is a lie)");
    }
    function parseMesh(mesh) {
        console.log("--------------------------------");
        // * export modes go here.
        const geometry = mesh.geometry;
        const element = OutlinerNode.uuids[mesh.name];
        if (!element)
            return;
        if (element.export === false)
            return;
        const normalMatrixWorld = new THREE.Matrix3();
        normalMatrixWorld.getNormalMatrix(mesh.matrixWorld);
        if (element instanceof Cube) {
            print(" that's a cube all right");
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
    });
})();
