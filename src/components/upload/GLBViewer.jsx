import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Loader2 } from 'lucide-react';

export default function GLBViewer({ file, label }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Load model
    const loader = new GLTFLoader();
    let url;
    let shouldRevokeUrl = false;
    
    if (!file) {
      setLoading(false);
      return;
    }

    if (file instanceof Blob) {
      url = URL.createObjectURL(file);
      shouldRevokeUrl = true;
    } else {
      url = file;
    }

    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        // Auto-fit camera to model
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5;
        camera.position.z = cameraZ;
        camera.lookAt(box.getCenter(new THREE.Vector3()));

        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('GLB load error:', err);
        setError('Failed to load 3D model');
        setLoading(false);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (sceneRef.current?.children[2]) {
        sceneRef.current.children[2].rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (shouldRevokeUrl) {
        URL.revokeObjectURL(url);
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [file]);

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-lg overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <p className="text-white text-sm">{error}</p>
        </div>
      )}
      {label && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-xs font-medium">
          {label}
        </div>
      )}
    </div>
  );
}