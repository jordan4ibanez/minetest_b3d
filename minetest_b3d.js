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
    class WorkerContainer {
        // MEGA resizeable buffer.
        buffer = new ArrayBuffer(0, {
            // ~128 MB limit. A HUGE MODEL!
            maxByteLength: 1000 * 1000 * 128
        });
        // A nice view of the buffer. Brings additional features.
        view = new DataView(this.buffer);
        byteLength() {
            return this.buffer.byteLength;
        }
        getCurrent(byteSize) {
            return this.buffer.byteLength - byteSize;
        }
        grow(bytes) {
            this.buffer.resize(this.buffer.byteLength + bytes);
        }
        //* Disabled in case I accidentally call it, this is JS after all.
        // reset() {
        //   this.buffer.resize(0)
        // }
        appendHeader(name, numberOfElements) {
            this.appendString(name);
            this.appendInt32(numberOfElements);
        }
        appendQuaternion(x, y, z, w) {
            // W is actually first but don't tell anyone.
            this.appendFloat(w);
            this.appendFloat(x);
            this.appendFloat(y);
            this.appendFloat(z);
        }
        appendVec2(x, y) {
            this.appendFloat(x);
            this.appendFloat(y);
        }
        appendVec3(x, y, z) {
            this.appendFloat(x);
            this.appendFloat(y);
            this.appendFloat(z);
        }
        appendFloat(float) {
            const sizeInBytes = 4;
            this.grow(sizeInBytes);
            this.view.setFloat32(this.getCurrent(sizeInBytes), float, true);
        }
        appendInt32(int32) {
            const sizeInBytes = 4;
            this.grow(sizeInBytes);
            this.view.setInt32(this.getCurrent(sizeInBytes), int32, true);
        }
        appendInt8(int8) {
            const sizeInBytes = 1;
            this.grow(sizeInBytes);
            this.view.setInt8(this.getCurrent(sizeInBytes), int8, true);
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
    // These ones get turned into a new object over and over.
    let tempContainer = new WorkerContainer();
    let nodeContainer = new WorkerContainer();
    let meshContainer = new WorkerContainer();
    let verticesContainer = new WorkerContainer();
    let trisContainer = new WorkerContainer();
    const shellContainer = new WorkerContainer();
    const textureCoordinates = new WorkerContainer();
    const masterContainer = new WorkerContainer();
    // function encaseChunk(chunkName, encasingContainer, bufferToBeEncased) {
    //   encasingContainer.appendString(chunkName);
    //   encasingContainer.appendInt32(bufferToBeEncased.byteLength());
    //   for (const byte of new Uint8Array(bufferToBeEncased.buffer)) {
    //     encasingContainer.appendInt8(byte)
    //   }
    // }
    function finalizeChunk(chunkName, chunkToBeFinalized) {
        const tempChunk = new WorkerContainer();
        tempChunk.appendString(chunkName);
        tempChunk.appendInt32(chunkToBeFinalized.byteLength());
        const startIndex = tempChunk.byteLength();
        tempChunk.grow(chunkToBeFinalized.byteLength());
        for (let i = 0; i < chunkToBeFinalized.byteLength(); i++) {
            tempChunk.view.setInt8(i + startIndex, chunkToBeFinalized.view.getInt8(i));
        }
        return tempChunk;
    }
    // Gives back a MESH node!
    function combineVertsTris(verts, tris) {
        const tempChunk = new WorkerContainer();
        tempChunk.appendString("MESH");
        tempChunk.appendInt32(verts.byteLength() + tris.byteLength());
        let startIndex = tempChunk.byteLength();
        tempChunk.grow(verts.byteLength());
        for (let i = 0; i < verts.byteLength(); i++) {
            tempChunk.view.setInt8(i + startIndex, verts.view.getInt8(i));
        }
        startIndex = tempChunk.byteLength();
        tempChunk.grow(tris.byteLength());
        for (let i = 0; i < tris.byteLength(); i++) {
            tempChunk.view.setInt8(i + startIndex, verts.view.getInt8(i));
        }
        return tempChunk;
    }
    function combineMeshIntoNode(nodeNode, meshNode) {
        const tempChunk = new WorkerContainer();
        tempChunk.appendString("NODE");
        tempChunk.appendInt32(nodeNode.byteLength() + meshNode.byteLength());
        let startIndex = tempChunk.byteLength();
        tempChunk.grow(nodeNode.byteLength());
        for (let i = 0; i < nodeNode.byteLength(); i++) {
            tempChunk.view.setInt8(i + startIndex, nodeNode.view.getInt8(i));
        }
        startIndex = tempChunk.byteLength();
        tempChunk.grow(meshNode.byteLength());
        for (let i = 0; i < meshNode.byteLength(); i++) {
            tempChunk.view.setInt8(i + startIndex, meshNode.view.getInt8(i));
        }
        return tempChunk;
    }
    function resetTempContainer() {
        tempContainer = new WorkerContainer();
    }
    function completeInteraction(finalNode) {
        const tempChunk = new WorkerContainer();
        tempChunk.appendString("BB3D");
        tempChunk.appendInt32(finalNode.byteLength() + 4);
        tempChunk.appendInt32(1);
        let startIndex = tempChunk.byteLength();
        tempChunk.grow(finalNode.byteLength());
        for (let i = 0; i < finalNode.byteLength(); i++) {
            tempChunk.view.setInt8(i + startIndex, finalNode.view.getInt8(i));
        }
        return tempChunk;
    }
    function exportIt() {
        //todo: Eventually, only export selected things as an option.
        //! Here we are trying to make a triangle.
        // Blockbench.writeFile("/home/jordan/.minetest/games/forgotten-lands/mods/minecart/models/minecart.b3d", {
        //   content: finalizedModel.buffer
        // })
        print("exported minecart.");
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
//# sourceMappingURL=minetest_b3d.js.map