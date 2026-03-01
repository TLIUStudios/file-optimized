import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Settings, Maximize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import GLBViewerSettings from './GLBViewerSettings';

export default function GLBViewer({ file, label, isBlob = false }) {
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
    autoRotateAngle: 0,
    autoRotateTimeout: null
  });
  const [autoRotateActive, setAutoRotateActive] = useState(true);

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
      setAutoRotateActive(false);
      if (controlsRef.current.autoRotateTimeout) {
        clearTimeout(controlsRef.current.autoRotateTimeout);
      }
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
      // Resume auto-rotate after 800ms of inactivity
      if (controlsRef.current.autoRotateTimeout) {
        clearTimeout(controlsRef.current.autoRotateTimeout);
      }
      controlsRef.current.autoRotateTimeout = setTimeout(() => {
        setAutoRotateActive(true);
      }, 800);
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
    renderer.domElement.addEventListener('contextmenu', onContextMenu);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Auto-rotate when enabled and not interacting
      if (settings.autoRotate && autoRotateActive && !controlsRef.current.isDragging && !controlsRef.current.isPanning && modelRef.current) {
        controlsRef.current.autoRotateAngle += 0.003;
        modelRef.current.rotation.y = controlsRef.current.rotation.y + controlsRef.current.autoRotateAngle;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle brightness changes
    if (lightRef.current) {
      lightRef.current.ambientLight.intensity = brightness * 1.2;
      lightRef.current.directionalLight.intensity = brightness;
    }

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('contextmenu', onContextMenu);
      renderer.domElement.removeEventListener('wheel', onWheel);
      
      if (shouldRevokeUrl) {
        URL.revokeObjectURL(url);
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [file, settings, brightness]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setZoom(1);
    setBrightness(1);
    controlsRef.current = {
      isDragging: false,
      isPanning: false,
      previousMousePosition: { x: 0, y: 0 },
      rotation: { x: 0, y: 0 },
      zoom: 1,
      autoRotateAngle: 0
    };
    if (modelRef.current) {
      modelRef.current.position.set(0, 0, 0);
      modelRef.current.rotation.set(0, 0, 0);
    }
    if (cameraRef.current) {
      cameraRef.current.position.z = 3;
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      }
    }
  };

  const zoomPercent = Math.round(100 / (zoom * 0.5));
  const brightnessPercent = Math.round(brightness * 100);

  const mouseIcon = (active) => {
    const left = active === 'left' ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.25)';
    const right = active === 'right' ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.25)';
    const wheel = active === 'wheel' ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.35)';
    return `
      <svg width="16" height="16" viewBox="0 0 24 24" style="display:inline-block;vertical-align:middle;">
        <rect x="7" y="2.5" width="10" height="19" rx="5" ry="5" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="1.5"/>
        <path d="M12 3.5v5.8" stroke="${wheel}" strokeWidth="2" strokeLinecap="round"/>
        <path d="M7.6 7.4h4.4v4.6H7.6z" fill="${left}"/>
        <path d="M12 7.4h4.4v4.6H12z" fill="${right}"/>
      </svg> <span>${active === 'left' ? 'Left: Rotate' : active === 'right' ? 'Right: Pan' : 'Scroll: Zoom'}</span>
    `;
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-slate-300/50 dark:border-slate-600/50">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Loading skeleton overlay */}
      {loading && (
        <div className="absolute inset-0 rounded-lg z-20 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700" />
          <div className="absolute inset-0 -left-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
        </div>
      )}

      {/* Top Left - Stats Pills */}
      <div className="absolute top-3 left-4 z-30 flex flex-col gap-3">
        <div className="space-y-2">
          <div className="px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/12 text-white text-xs font-medium">
            Zoom: <span className="font-bold">{zoomPercent}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/12 text-white text-xs font-medium">
            Brightness: <span className="font-bold">{brightnessPercent}%</span>
          </div>
        </div>
        
        <div className="w-40">
          <input
            type="range"
            min={10}
            max={200}
            value={brightnessPercent}
            onChange={(e) => setBrightness(Number(e.target.value) / 100)}
            className="w-full accent-slate-900 dark:accent-white"
            style={{
              WebkitAppearance: 'slider-horizontal',
              appearance: 'slider-horizontal'
            }}
          />
        </div>
      </div>

      {/* Top Right - Controls */}
      <div className="absolute top-3 right-4 z-30 flex flex-col gap-2">
        <button
          onClick={() => setShowSettings(true)}
          className="h-10 w-10 rounded-lg bg-black/55 backdrop-blur-md border border-white/12 hover:bg-white/14 transition-colors flex items-center justify-center text-white"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          onClick={handleFullscreen}
          className="h-10 w-10 rounded-lg bg-black/55 backdrop-blur-md border border-white/12 hover:bg-white/14 transition-colors flex items-center justify-center text-white"
          title="Fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
        <button
          onClick={handleReset}
          className="h-10 w-10 rounded-lg bg-black/55 backdrop-blur-md border border-white/12 hover:bg-white/14 transition-colors flex items-center justify-center text-white"
          title="Reset View"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom - Help Text */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-30 bg-black/55 backdrop-blur-md border border-white/12 px-3 py-2 rounded-full text-white text-xs flex gap-2 whitespace-nowrap">
        <div className="flex items-center gap-2 opacity-95">
          <svg width="14" height="14" viewBox="0 0 24 24" style={{display:'inline-block'}}>
            <rect x="7" y="2.5" width="10" height="19" rx="5" ry="5" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="1.5"/>
            <path d="M12 3.5v5.8" stroke="rgba(255,255,255,.9)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7.6 7.4h4.4v4.6H7.6z" fill="rgba(255,255,255,.9)"/>
            <path d="M12 7.4h4.4v4.6H12z" fill="rgba(255,255,255,.25)"/>
          </svg>
          <span>Left: Rotate</span>
        </div>
        <span className="opacity-35">|</span>
        <div className="flex items-center gap-2 opacity-95">
          <svg width="14" height="14" viewBox="0 0 24 24" style={{display:'inline-block'}}>
            <rect x="7" y="2.5" width="10" height="19" rx="5" ry="5" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="1.5"/>
            <path d="M12 3.5v5.8" stroke="rgba(255,255,255,.35)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7.6 7.4h4.4v4.6H7.6z" fill="rgba(255,255,255,.25)"/>
            <path d="M12 7.4h4.4v4.6H12z" fill="rgba(255,255,255,.9)"/>
          </svg>
          <span>Right: Pan</span>
        </div>
        <span className="opacity-35">|</span>
        <div className="flex items-center gap-2 opacity-95">
          <svg width="14" height="14" viewBox="0 0 24 24" style={{display:'inline-block'}}>
            <rect x="7" y="2.5" width="10" height="19" rx="5" ry="5" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="1.5"/>
            <path d="M12 3.5v5.8" stroke="rgba(255,255,255,.9)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7.6 7.4h4.4v4.6H7.6z" fill="rgba(255,255,255,.25)"/>
            <path d="M12 7.4h4.4v4.6H12z" fill="rgba(255,255,255,.25)"/>
          </svg>
          <span>Scroll: Zoom</span>
        </div>
      </div>

      {error && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 rounded-lg">
          <p className="text-white text-sm text-center px-4">{error}</p>
        </div>
      )}

      <GLBViewerSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={handleSettingChange}
      />

      <style>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .animate-shimmer {
          animation: shimmer 1.05s linear infinite;
        }
        input[type="range"] {
          cursor: pointer;
          height: 6px;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        input[type="range"]::-webkit-slider-runnable-track {
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
        }
        input[type="range"]::-moz-range-track {
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          border: none;
        }
      `}</style>
    </div>
  );
}