(function () {
  var button;
  const print = console.log;
})();

Plugin.register("minetest_b3d", {
  title: "Minetest B3D Exporter.",
  author: "jordan4ibanez",
  icon: "icon-objects",
  description: "Export models into Minetest using B3D.",
  tags: ["minetest", "b3d", "export"],
  version: "0.0.1",
  variant: 'both',
  onload() {

    const print = console.log;

    console.log("yerp")

    button = new Action('randomize_height', {
      name: 'Export B3D Model',
      description: 'Export model as B3D for minetest.',
      icon: 'icon-objects',
      click: function () {

        //* Cube only implementation

        console.log("hi")

        let i = 0
        Cube.selected.forEach(cube => {

          // print(cube.mesh)
          const mesh = cube.getMesh()

          // MeshFace
          //! Need to get mesh faces then can get sorted vertices
          const faces = mesh.faces
          print(faces)
          for (const face in faces) {
            print(face)
          }
          // print(cube.getMesh())
          // print(mesh.getSortedVertices())
          // print(cube.getSortedVertices())


          // for (const face of Object.entries(cube.faces)) {
          //   print(face)
          // }
          // print(cube)
          // const mesh = cube.getMesh()

          
          // print(mesh)
          // const isObject3d = mesh.isObject3d

          // print(isObject3d)
          // print(mesh.faces)
          i++

        });

        // i = 0
        // Mesh.selected.forEach(mesh => {
        //   console.log(i)
        // })

        // console.log("hi")
        // Blockbench.showToastMessage("hi", 5)
        // Blockbench.notification("hi")

        // This is a hardcode on my workstation so I can just keep running this.
        // ~~oo a peak into a developer's computer, spooky~~



        Blockbench.writeFile("/home/jordan/.minetest/games/forgotten-lands/mods/minecart/models/minecart.b3d", {
          content: "test"
        })



        // Canvas.updateView({
        //     elements: Cube.selected,
        //     element_aspects: {geometry: true},
        //     selection: true
        // });
        // Undo.finishEdit('Export B3D model for minetest.');
      }
    });
    MenuBar.addAction(button, 'file.export.0');
  },
  onunload() {
    button.delete();
  }
})