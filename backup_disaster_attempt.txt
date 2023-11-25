  // Shell container holds all "branches" of this tree data structure.

  // B3D Version 1.
  shellContainer.appendInt32(1)




  // Mesh container needs to be encased by the NODES container.

  //! Vertices.

  // Texture coordinate sets per vertex. Will always be 1 because blockbench doesn't do advanced blender features. (I think?)
  verticesContainer.appendInt32(1)

  // Components (x,y,z) per set. Will always be 2 because blockbench models are simple texture maps. So (x,y).
  verticesContainer.appendInt32(2)

  // Positions. XYZ
  // Normals. We'll go with -Z. XYZ
  // Texture coordinates.

//{
  verticesContainer.appendVec3(-1,-1,0) // position
  verticesContainer.appendVec3(0,0,-1)  // normal
  verticesContainer.appendVec3(0,1)     // texture coordinate

  verticesContainer.appendVec3(1,-1,0)  // position
  verticesContainer.appendVec3(0,0,-1)  // normal
  verticesContainer.appendVec3(1,1)     // texture coordinate

  verticesContainer.appendVec3(0,1,0)   // position
  verticesContainer.appendVec3(0,0,-1)  // normal
  verticesContainer.appendVec3(0.5,0)   // texture coordinate
//}

  const finalizedVertices = finalizeChunk("VRTS", verticesContainer)


  // Brush ID. -1 is disabled basically.
  trisContainer.appendInt32(-1)

  // Indices.
//{
  trisContainer.appendInt32(0)
  trisContainer.appendInt32(1)
  trisContainer.appendInt32(2)
// }

  const finalizedTris = finalizeChunk("TRIS", trisContainer)

  const finalizedMESH = combineVertsTris(finalizedVertices, finalizedTris)



  //! Nodes.
  // Node name
  nodeContainer.appendString("cool")
  // // Position. Vec3.
  nodeContainer.appendVec3(0,0,0)
  // // Scale. Vec3.
  nodeContainer.appendVec3(1,1,1)
  // // Rotation. Quaternion.
  nodeContainer.appendQuaternion(0,0,0,1)


  const finalizedNode = combineMeshIntoNode(nodeContainer, finalizedMESH)
  // encaseChunk("NODE", nodeContainer, finalizedMESH)
  // resetTempContainer()


  const finalizedModel = completeInteraction(finalizedNode)