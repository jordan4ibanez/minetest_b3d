
  //! Texture information.

  // Header & number of elements
  // buffer.appendString("TEXS", 0)

  // // Texture name(s).
  // tempContainer.appendString("test.png")

  // // Texture flag 1. (What even is this?)
  // tempContainer.appendInt32(1)

  // // Texture flag 2. (blend)
  // tempContainer.appendInt32(2)

  // // Position. X, Y
  // tempContainer.appendVec2(0,0)

  // // Scale. X, Y
  // tempContainer.appendVec2(1,1)

  // // Rotation, in radians.
  // tempContainer.appendFloat(0)

  // encaseChunk("TEXS", shellContainer, tempContainer)

  // resetTempContainer()

    //! Brushes. (WTF is brushes??)

  // Header & number of elements.
  // buffer.appendHeader("BRUS", 0)

    //! Mesh.

  // Brush ID.
  // tempContainer.appendInt32(-1)

  // encaseChunk("MESH", shellContainer, tempContainer)

  // resetTempContainer()



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