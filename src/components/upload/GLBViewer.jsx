import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Loader2, Settings, Maximize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import GLBViewerSettings from './GLBViewerSettings';

export default function GLBViewer({ file, label }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const lightRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [settings, setSettings] = useState({
    backgroundColor: 'dark',
    autoRotate: true
  });

  // Mouse controls state
  const controlsRef = useRef({
    isDragging: false,
    isPanning: false,
    previousMousePosition: { x: 0, y: 0 },
    rotation: { x: 0, y: 0 },
    zoom: 1,
    autoRotateAngle: 0
  });

  useEffect(() => {
    if (!file || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const bgColor = settings.backgroundColor === 'dark' ? 0x0f172a : 0xf5f5f5;
    scene.background = new THREE.Color(bgColor);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 3;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, brightness * 1.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, brightness);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    lightRef.current = { ambientLight, directionalLight };

    // Load model
    const loader = new GLTFLoader();
    let url;
    let shouldRevokeUrl = false;
    
    if (!file) {
      setLoading(false);
      return;
    }

    // Handle both Blob and File objects
    if (file instanceof Blob || file instanceof File) {
      url = URL.createObjectURL(file);
      shouldRevokeUrl = true;
    } else {
      url = file;
    }

    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;
        
        // Clear previous models if any
        const previousModels = scene.children.filter(child => (child.isGroup || child.isMesh) && child !== ambientLight && child !== directionalLight);
        previousModels.forEach(m => scene.remove(m));
        
        scene.add(model);

        // Auto-fit camera to model
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5;
        
        camera.position.set(center.x, center.y, center.z + cameraZ);
        camera.lookAt(center);

        setError(null);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('GLB load error:', err);
        setError('Failed to load 3D model');
        setLoading(false);
      }
    );

    // Mouse controls
    const onMouseDown = (e) => {
      if (e.button === 0) {
        // Left click - rotate
        controlsRef.current.isDragging = true;
        controlsRef.current.previousMousePosition = { x: e.clientX, y: e.clientY };
      } else if (e.button === 2) {
        // Right click - pan
        controlsRef.current.isPanning = true;
        controlsRef.current.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseMove = (e) => {
      if (!modelRef.current) return;

      const deltaX = e.clientX - controlsRef.current.previousMousePosition.x;
      const deltaY = e.clientY - controlsRef.current.previousMousePosition.y;

      if (controlsRef.current.isDragging) {
        controlsRef.current.rotation.y += deltaX * 0.01;
        controlsRef.current.rotation.x += deltaY * 0.01;
        modelRef.current.rotation.y = controlsRef.current.rotation.y;
        modelRef.current.rotation.x = controlsRef.current.rotation.x;
      }

      if (controlsRef.current.isPanning) {
        const panSpeed = 0.01;
        modelRef.current.position.x -= deltaX * panSpeed;
        modelRef.current.position.y += deltaY * panSpeed;
      }

      controlsRef.current.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      controlsRef.current.isDragging = false;
      controlsRef.current.isPanning = false;
    };

    const onContextMenu = (e) => {
      e.preventDefault();
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomSpeed = 0.15;
      controlsRef.current.zoom += e.deltaY > 0 ? zoomSpeed : -zoomSpeed;
      controlsRef.current.zoom = Math.max(0.5, Math.min(3, controlsRef.current.zoom));
      setZoom(controlsRef.current.zoom);
      cameraRef.current.position.z = 3 * controlsRef.current.zoom;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      
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