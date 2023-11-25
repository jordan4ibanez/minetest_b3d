(function () {
    // This is basically the TS equivalent of adding local in front of everything in lua.
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
    class Element {
        constructor() {
            this.byteSize = 0;
        }
        addBytes(byteSize) {
            this.byteSize += byteSize;
        }
    }
    // Master container class.
    class B3d extends Element {
        constructor() {
            super(...arguments);
            this.byteSize = (1 * 4);
            this.version = 1;
            this.rootNode = null;
        }
        addRootNode(node) {
            if (this.rootNode !== null) {
                throw new Error("Cannot set the root note on a B3d container more than once!");
            }
            this.addBytes(node.byteSize);
            this.rootNode = node;
        }
    }
    class Node extends Element {
        constructor(name) {
            super();
            this.byteSize = (3 * 3 * 4) * Float;
            this.position = new Vec3(0, 0, 0);
            this.scale = new Vec3(1, 1, 1);
            this.rotation = new Quaternion(0, 0, 0, 1);
            // Allow rapidly indexing through the tree.
            this.parent = null;
            this.children = [];
            this.name = name;
            this.addBytes(name.length * Char);
        }
        setParent(node) {
            this.parent = node;
            this.parent.addBytes(this.byteSize);
            // Recurse through the tree to add all bytes.
            if (this.parent.parent) {
                this.parent.parent.addBytes(this.byteSize);
            }
        }
        addChild(nodeOrElement) {
            this.children.push(nodeOrElement);
        }
    }
    // Specific classification to filter objects that Node can hold.
    class NodeElement extends Element {
    }
    class Mesh extends NodeElement {
        constructor() {
            super(...arguments);
            this.byteSize = Integer * 1;
            this.brush = -1;
            this.vrts = null;
            this.tris = null;
        }
        setVerts(newVert) {
            if (this.vrts !== null) {
                throw new Error("Cannot reassign vrts into a Mesh!");
            }
            this.addBytes(newVert.byteSize);
            this.vrts = newVert;
        }
        setTris(newTris) {
            if (this.tris !== null) {
                throw new Error("Cannot reassign tris into a Mesh!");
            }
            this.addBytes(newTris.byteSize);
            this.tris = newTris;
        }
    }
    class Verts extends Element {
        addVertex(element) {
            this.addBytes(element.byteSize);
            this.data.push(element);
        }
        constructor(vertexList) {
            super();
            this.byteSize = Integer + Integer + (Integer * 2);
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
            this.byteSize = (Float * 3) + (Float * 3) + (Float * 2);
            this.position = def.position;
            this.normal = def.normal;
            this.textureCoordinates = def.textureCoordinates;
        }
    }
    class Tris extends Element {
        // Builder pattern || direct construction.
        addTri(newTri) {
            this.addBytes(Integer * 3);
            this.triWindings.push(newTri);
            print("new bytesize in tri: " + this.byteSize);
        }
        constructor(windingList) {
            super();
            this.byteSize = Integer;
            this.brushID = -1;
            this.triWindings = [];
            if (windingList) {
                windingList.forEach((winding) => {
                    this.addTri(winding);
                });
            }
        }
    }
    function exportIt() {
        //todo: Eventually, only export selected things as an option.
        //! Here we are trying to make a triangle.
        const masterContainer = new B3d();
        const rootNode = new Node("root_node");
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
        coolMesh.setTris(triangleTris);
        rootNode.addChild(coolMesh);
        masterContainer.addRootNode(rootNode);
        print("omega size: " + masterContainer.byteSize);
        // Blockbench.writeFile("/home/jordan/.minetest/games/forgotten-lands/mods/minecart/models/minecart.b3d", {
        //   content: finalizedModel.buffer
        // })
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
