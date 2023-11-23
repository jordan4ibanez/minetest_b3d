(function() {
  var button;
})();

Plugin.register("minetest_b3d",{
  title: "Minetest B3D Exporter.",
  author: "jordan4ibanez",
  icon: "icon-objects",
  description: "Export models into Minetest using B3D.",
  tags: ["minetest", "b3d", "export"],
  version: "0.0.1",
  variant: 'both',
  onload() {

    console.log("yerp")

    button = new Action('randomize_height', {
        name: 'Export B3D Model',
        description: 'Export model as B3D for minetest.',
        icon: 'icon-objects',
        click: function() {
          console.log("hi")

          let i = 0
          Cube.selected.forEach(cube => {
            // cube.to[1] = cube.from[0] + Math.floor(Math.random()*8);
            console.log(i)
            console.log(cube)
            i++
          });

          // console.log("hi")
          // Blockbench.showToastMessage("hi", 5)
          // Blockbench.notification("hi")

          



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