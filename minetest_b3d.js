(function () {

var button;
const print = console.log;

const cube_face_normals = {
	north: [ 0,  0, -1],
	east:  [ 1,  0,  0],
	south: [ 0,  0,  1],
	west:  [-1,  0,  0],
	up:    [ 0,  1,  0],
	down:  [ 0, -1,  0],
}

function parseMesh(mesh) {
  console.log("--------------------------------")

}

function exportIt() {
  //todo: Eventually, only export selected things as an option.

  scene.traverse(function(child){
    if (child instanceof THREE.Mesh) parseMesh(child)
  })
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
        exportIt()
      }
    });

    MenuBar.addAction(button, 'file.export.0');
  },
  onunload() {
    button.delete();
  }
})

})();