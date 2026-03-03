import { WebIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, draco } from '@gltf-transform/functions';

/**
 * Compresses a GLB file using gltf-transform with Draco mesh compression.
 * This is the same approach used by Shopify's gltf-compressor tool.
 * 
 * Pipeline:
 * 1. dedup  - removes duplicate vertex data
 * 2. weld   - merges nearby vertices  
 * 3. prune  - removes unused nodes/materials/textures
 * 4. draco  - applies Draco mesh compression (~40-70% size reduction on geometry)
 */
export async function compressGLB(file) {
  const blobUrl = URL.createObjectURL(file);

  try {
    // Load Draco codec WASM modules
    const { createDecoderModule, createEncoderModule } = await import('draco3d');
    const [dracoDecoder, dracoEncoder] = await Promise.all([
      createDecoderModule(),
      createEncoderModule(),
    ]);

    // Set up WebIO with all gltf extensions and Draco dependencies
    const io = new WebIO()
      .registerExtensions(ALL_EXTENSIONS)
      .registerDependencies({
        'draco3d.decoder': dracoDecoder,
        'draco3d.encoder': dracoEncoder,
      });

    // Parse the GLB file from blob URL
    const doc = await io.read(blobUrl);

    // Apply optimization + compression pipeline
    await doc.transform(
      dedup(),   // Remove duplicate vertex attributes & images
      weld(),    // Merge shared vertices  
      prune(),   // Strip unused nodes, meshes, materials, textures
      draco(),   // Draco geometry compression
    );

    // Serialize back to GLB binary
    const arrayBuffer = await io.writeBinary(doc);
    return new Blob([arrayBuffer], { type: 'model/gltf-binary' });

  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}