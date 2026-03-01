import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three-stdlib';

export async function compressGLB(file) {
  const loader = new GLTFLoader();
  const exporter = new GLTFExporter();

  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Parse GLB with loader
  const gltf = await new Promise((resolve, reject) => {
    loader.parse(arrayBuffer, '', resolve, reject);
  });

  const scene = gltf.scene;

  // Export as GLB with Draco compression enabled
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (data) => {
        const blob = new Blob([data], { type: 'model/gltf-binary' });
        resolve(blob);
      },
      (error) => reject(error),
      { binary: true, draco: { enabled: true } }
    );
  });
}