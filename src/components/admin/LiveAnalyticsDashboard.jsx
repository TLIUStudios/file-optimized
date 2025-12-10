import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileUp, HardDrive, TrendingUp, Globe as GlobeIcon, Activity, X, ExternalLink, Crown, Calendar, Mail, MapPin } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function LiveAnalyticsDashboard() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [globe, setGlobe] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const controlsRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const markersRef = useRef([]);
  const [globeStyle, setGlobeStyle] = useState('earth');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const labelsRef = useRef([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Fetch all users
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 1000),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch compression stats
  const { data: allStats = [] } = useQuery({
    queryKey: ['admin-all-stats'],
    queryFn: () => base44.entities.CompressionStat.list('-created_date', 10000),
    refetchInterval: 5000, // Update every 5 seconds for live feel
    onSuccess: (newStats) => {
      // Update recent activity
      if (newStats.length > 0) {
        setRecentActivity(newStats.slice(0, 15));
      }
    }
  });

  // Calculate metrics
  const totalUsers = users.length;
  const proUsers = users.filter(u => u.plan === 'pro').length;
  const totalFiles = allStats.length;
  const totalSpaceSaved = allStats.reduce((sum, stat) => {
    const saved = stat.original_size - stat.compressed_size;
    return sum + Math.max(0, saved);
  }, 0);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    if (bytes < 1024 * 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2) + ' TB';
  };

  // Initialize 3D Globe with interactivity
  useEffect(() => {
    if (!canvasRef.current || users.length === 0) return;

    const scene = new THREE.Scene();
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.set(0, 0, 2.5);

    // Add OrbitControls for interactivity
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;
    controls.minDistance = 2;
    controls.maxDistance = 5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;

    // Create globe with different styles
    const geometry = new THREE.SphereGeometry(1, 128, 128);
    let material;

    if (globeStyle === 'earth') {
      // Load realistic Earth texture
      const textureLoader = new THREE.TextureLoader();
      const earthTexture = textureLoader.load('https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg');
      const bumpTexture = textureLoader.load('https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png');
      
      material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: bumpTexture,
        bumpScale: 0.015,
        shininess: 15,
        specular: new THREE.Color(0x333333)
      });
    } else if (globeStyle === 'white') {
      material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.7,
        emissive: 0xf8fafc,
        emissiveIntensity: 0.2
      });
    } else if (globeStyle === 'black') {
      material = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.3,
        roughness: 0.5,
        emissive: 0x1e293b,
        emissiveIntensity: 0.3
      });
    } else {
      // green style
      material = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        metalness: 0.2,
        roughness: 0.6,
        emissive: 0x059669,
        emissiveIntensity: 0.25
      });
    }

    const sphere = new THREE.Mesh(geometry, material);
    sphere.userData = { isSphere: true };
    scene.add(sphere);

    // Add wireframe overlay (only for non-earth styles)
    let wireframe = null;
    if (globeStyle !== 'earth') {
      const wireframeGeometry = new THREE.SphereGeometry(1.005, 36, 36);
      const wireframeColor = globeStyle === 'white' 
        ? 0xd1d5db
        : globeStyle === 'black' 
        ? 0x475569 
        : 0x059669;
      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: wireframeColor,
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });
      wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
      wireframe.userData = { isWireframe: true };
      scene.add(wireframe);
    }

    // Add atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(1.12, 64, 64);
    const atmosphereColor = globeStyle === 'earth' 
      ? 0x4a9eff
      : globeStyle === 'white'
      ? 0x94a3b8
      : globeStyle === 'black'
      ? 0x3b82f6
      : 0x34d399;
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: atmosphereColor,
      transparent: true,
      opacity: globeStyle === 'earth' ? 0.12 : 0.08,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.userData = { isAtmosphere: true };
    scene.add(atmosphere);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, globeStyle === 'earth' ? 0.4 : 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, globeStyle === 'earth' ? 1.2 : 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.position.set(-5, -3, -5);
    scene.add(pointLight);

    // Add location labels
    const createLabel = (text, lat, lon, isOcean = false) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const radius = 1.15;
      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 128;
      
      context.fillStyle = 'transparent';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      const fontSize = isOcean ? 32 : 42;
      context.font = `${isOcean ? 'italic' : 'bold'} ${fontSize}px Arial`;
      context.fillStyle = globeStyle === 'earth' 
        ? (isOcean ? '#4a9eff' : '#ffffff')
        : globeStyle === 'white'
        ? '#334155'
        : globeStyle === 'black'
        ? '#ffffff'
        : '#10b981';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true,
        opacity: showLabels ? (isOcean ? 0.5 : 0.8) : 0
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x, y, z);
      sprite.scale.set(isOcean ? 0.6 : 0.4, isOcean ? 0.15 : 0.1, 1);
      sprite.userData = { isLabel: true };
      scene.add(sprite);
      return sprite;
    };

    // Add major countries and cities
    const labels = [];
    if (showLabels) {
      const locations = [
        // Countries/Regions
        { name: 'USA', lat: 39, lon: -95, ocean: false },
        { name: 'Canada', lat: 56, lon: -106, ocean: false },
        { name: 'Brazil', lat: -10, lon: -55, ocean: false },
        { name: 'UK', lat: 54, lon: -2, ocean: false },
        { name: 'France', lat: 47, lon: 2, ocean: false },
        { name: 'Germany', lat: 51, lon: 10, ocean: false },
        { name: 'Russia', lat: 60, lon: 100, ocean: false },
        { name: 'China', lat: 35, lon: 105, ocean: false },
        { name: 'India', lat: 20, lon: 77, ocean: false },
        { name: 'Japan', lat: 36, lon: 138, ocean: false },
        { name: 'Australia', lat: -25, lon: 133, ocean: false },
        { name: 'South Africa', lat: -29, lon: 24, ocean: false },
        // Oceans
        { name: 'Pacific Ocean', lat: 0, lon: -160, ocean: true },
        { name: 'Atlantic Ocean', lat: 15, lon: -30, ocean: true },
        { name: 'Indian Ocean', lat: -20, lon: 80, ocean: true },
      ];

      locations.forEach(loc => {
        labels.push(createLabel(loc.name, loc.lat, loc.lon, loc.ocean));
      });
    }
    labelsRef.current = labels;

    // Generate realistic user locations based on population density
    const locationClusters = [
      // North America
      { lat: 40.7128, lon: -74.0060, count: Math.floor(users.length * 0.15) }, // New York
      { lat: 34.0522, lon: -118.2437, count: Math.floor(users.length * 0.1) }, // Los Angeles
      { lat: 41.8781, lon: -87.6298, count: Math.floor(users.length * 0.05) }, // Chicago
      // Europe
      { lat: 51.5074, lon: -0.1278, count: Math.floor(users.length * 0.12) },  // London
      { lat: 48.8566, lon: 2.3522, count: Math.floor(users.length * 0.08) },   // Paris
      { lat: 52.5200, lon: 13.4050, count: Math.floor(users.length * 0.06) },  // Berlin
      // Asia
      { lat: 35.6762, lon: 139.6503, count: Math.floor(users.length * 0.15) }, // Tokyo
      { lat: 37.5665, lon: 126.9780, count: Math.floor(users.length * 0.08) }, // Seoul
      { lat: 31.2304, lon: 121.4737, count: Math.floor(users.length * 0.1) },  // Shanghai
      { lat: 19.0760, lon: 72.8777, count: Math.floor(users.length * 0.07) },  // Mumbai
      // Oceania
      { lat: -33.8688, lon: 151.2093, count: Math.floor(users.length * 0.04) }, // Sydney
    ];

    // Create user markers with data
    const markers = [];
    const markerGeometry = new THREE.SphereGeometry(0.015, 16, 16);
    const markerMaterialNormal = new THREE.MeshPhongMaterial({ 
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.5,
      shininess: 100
    });
    const markerMaterialHovered = new THREE.MeshPhongMaterial({ 
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 1,
      shininess: 100
    });
    const markerMaterialPro = new THREE.MeshPhongMaterial({ 
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8,
      shininess: 100
    });

    let userIndex = 0;
    locationClusters.forEach(cluster => {
      const usersInCluster = Math.min(cluster.count, users.length - userIndex);
      
      for (let i = 0; i < usersInCluster; i++) {
        if (userIndex >= users.length) break;
        
        const user = users[userIndex];
        userIndex++;
        
        // Add slight randomization around cluster center
        const latOffset = (Math.random() - 0.5) * 10;
        const lonOffset = (Math.random() - 0.5) * 10;
        const lat = cluster.lat + latOffset;
        const lon = cluster.lon + lonOffset;
        
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const radius = 1.05;
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        const material = user.plan === 'pro' ? markerMaterialPro.clone() : markerMaterialNormal.clone();
        const marker = new THREE.Mesh(markerGeometry, material);
        marker.position.set(x, y, z);
        marker.userData = { user, isMarker: true };
        scene.add(marker);
        markers.push(marker);

        // Add pulsing animation for Pro users
        if (user.plan === 'pro') {
          marker.userData.pulsePhase = Math.random() * Math.PI * 2;
        }
      }
    });

    markersRef.current = markers;
    setGlobe({ scene, camera, renderer, sphere, wireframe, controls });

    // Mouse move for hover detection
    const handleMouseMove = (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    // Click detection
    const handleClick = (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(markers);

      if (intersects.length > 0) {
        const clickedMarker = intersects[0].object;
        if (clickedMarker.userData.isMarker) {
          setSelectedUser(clickedMarker.userData.user);
          controls.autoRotate = false;
        }
      }
    };

    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('click', handleClick);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Update controls
      controls.update();

      // Rotate sphere and labels together
      if (controls.autoRotate) {
        sphere.rotation.y += 0.001;
        if (wireframe) wireframe.rotation.y += 0.001;
        labelsRef.current.forEach(label => {
          label.material.rotation += 0.001;
        });
      }

      // Update label opacity based on showLabels
      labelsRef.current.forEach(label => {
        if (label.material.opacity !== (showLabels ? (label.userData.isOcean ? 0.5 : 0.8) : 0)) {
          label.material.opacity = showLabels ? (label.userData.isOcean ? 0.5 : 0.8) : 0;
        }
      });

      // Pulse Pro markers
      markers.forEach(marker => {
        if (marker.userData.user?.plan === 'pro' && marker.userData.pulsePhase !== undefined) {
          marker.userData.pulsePhase += 0.05;
          const scale = 1 + Math.sin(marker.userData.pulsePhase) * 0.3;
          marker.scale.set(scale, scale, scale);
        }
      });

      // Hover detection
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(markers);
      
      // Reset all markers to normal
      markers.forEach(marker => {
        if (marker !== hoveredMarker) {
          marker.scale.set(1, 1, 1);
        }
      });

      if (intersects.length > 0) {
        const newHover = intersects[0].object;
        if (newHover.userData.isMarker) {
          newHover.scale.set(1.5, 1.5, 1.5);
          setHoveredMarker(newHover);
          canvasRef.current.style.cursor = 'pointer';
        }
      } else {
        setHoveredMarker(null);
        canvasRef.current.style.cursor = 'grab';
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      canvasRef.current?.removeEventListener('mousemove', handleMouseMove);
      canvasRef.current?.removeEventListener('click', handleClick);
      geometry.dispose();
      material.dispose();
      if (wireframe) {
        wireframe.geometry.dispose();
        wireframe.material.dispose();
      }
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      markerGeometry.dispose();
      markerMaterialNormal.dispose();
      markerMaterialHovered.dispose();
      markerMaterialPro.dispose();
      markers.forEach(m => m.geometry?.dispose());
      labelsRef.current.forEach(label => {
        label.material.map?.dispose();
        label.material.dispose();
      });
      controls.dispose();
      renderer.dispose();
    };
  }, [users, globeStyle, isDarkMode, showLabels]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalUsers}</p>
              <p className="text-sm text-slate-500">Total Users</p>
              <Badge className="mt-1 bg-amber-500 text-white text-xs">{proUsers} Pro</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <FileUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalFiles.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Files Processed</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatBytes(totalSpaceSaved)}</p>
              <p className="text-sm text-slate-500">Space Saved</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{users.filter(u => {
                const created = new Date(u.created_date);
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return created > dayAgo;
              }).length}</p>
              <p className="text-sm text-slate-500">New Users (24h)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Interactive Globe Visualization */}
      <Card className="p-6">
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center gap-2">
            <GlobeIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Interactive User Globe</h3>
            <Badge variant="outline" className="text-xs">Live • {totalUsers} Users</Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Globe Style Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
              <button
                onClick={() => setGlobeStyle('earth')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  globeStyle === 'earth'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🌍 Earth
              </button>
              <button
                onClick={() => setGlobeStyle('white')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  globeStyle === 'white'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ⚪ White
              </button>
              <button
                onClick={() => setGlobeStyle('black')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  globeStyle === 'black'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ⚫ Black
              </button>
              <button
                onClick={() => setGlobeStyle('green')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  globeStyle === 'green'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                💚 Green
              </button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowLabels(!showLabels)}
            >
              <MapPin className="w-4 h-4 mr-1" />
              {showLabels ? 'Hide' : 'Show'} Labels
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (controlsRef.current) {
                  controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
                }
              }}
            >
              {controlsRef.current?.autoRotate ? 'Pause' : 'Auto-Rotate'}
            </Button>
          </div>
        </div>
        <div ref={containerRef} className="relative w-full h-[450px] sm:h-[550px] lg:h-[650px] bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
          <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />
          
          {/* Hover tooltip */}
          {hoveredMarker && (
            <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl pointer-events-none z-10">
              <p className="text-sm font-semibold text-white">{hoveredMarker.userData.user.full_name || 'User'}</p>
              <p className="text-xs text-slate-400 mt-0.5">{hoveredMarker.userData.user.email}</p>
              {hoveredMarker.userData.user.plan === 'pro' && (
                <Badge className="mt-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px]">
                  <Crown className="w-2.5 h-2.5 mr-1" />
                  PRO USER
                </Badge>
              )}
              <p className="text-[10px] text-slate-500 mt-2">Click for details</p>
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 sm:px-4 hidden sm:block">
            <p className="text-[10px] sm:text-xs text-slate-300 text-center whitespace-nowrap">
              🖱️ Drag to rotate • 🔍 Scroll to zoom • 👆 Click markers for user details
            </p>
          </div>

          {/* Mobile instruction */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 sm:hidden">
            <p className="text-[10px] text-slate-300 text-center">
              👆 Drag & pinch • Tap markers for details
            </p>
          </div>

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-2 sm:p-3 space-y-1.5 sm:space-y-2 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-500/50"></div>
              <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Free</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50"></div>
              <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Pro</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3">
          🌍 Live global visualization • {totalUsers} users • Drag to explore • Click markers for profiles
        </p>
      </Card>

      {/* Selected User Detail Panel */}
      {selectedUser && (
        <Card className="p-4 sm:p-6 border-2 border-emerald-500 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                {selectedUser.full_name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{selectedUser.full_name || 'User'}</h3>
                  {selectedUser.plan === 'pro' && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      PRO
                    </Badge>
                  )}
                  {selectedUser.role === 'admin' && (
                    <Badge className="bg-blue-600 text-white text-xs">ADMIN</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{selectedUser.email}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedUser(null)}
              className="h-8 w-8 flex-shrink-0 sm:relative absolute top-4 right-4 sm:top-0 sm:right-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Joined</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {new Date(selectedUser.created_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1.5">
                <FileUp className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Files</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {allStats.filter(s => s.created_by === selectedUser.email).length.toLocaleString()}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1.5">
                <HardDrive className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Saved</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formatBytes(
                  allStats
                    .filter(s => s.created_by === selectedUser.email)
                    .reduce((sum, stat) => sum + Math.max(0, stat.original_size - stat.compressed_size), 0)
                )}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Plan</span>
              </div>
              <Badge variant={selectedUser.plan === 'pro' ? 'default' : 'outline'} className="text-xs font-bold">
                {selectedUser.plan === 'pro' ? 'PRO' : 'FREE'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`mailto:${selectedUser.email}`, '_blank')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(selectedUser.id);
                alert('User ID copied!');
              }}
            >
              Copy ID
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              asChild
            >
              <Link to={createPageUrl('Profile') + `?user=${selectedUser.id}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View Profile
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Real-Time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Live Activity Stream</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-slate-500">Live</span>
            </div>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                Waiting for activity...
              </p>
            ) : (
              recentActivity.map((stat, idx) => (
                <div key={stat.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    stat.media_type === 'image' ? 'bg-blue-100 dark:bg-blue-900' :
                    stat.media_type === 'video' ? 'bg-purple-100 dark:bg-purple-900' :
                    'bg-amber-100 dark:bg-amber-900'
                  }`}>
                    {stat.media_type === 'image' ? '🖼️' : stat.media_type === 'video' ? '🎬' : '🎵'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {stat.media_type.charAt(0).toUpperCase() + stat.media_type.slice(1)} → {stat.output_format.toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{stat.created_by}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      -{formatBytes(Math.max(0, stat.original_size - stat.compressed_size))}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {(() => {
                        const now = new Date();
                        const created = new Date(stat.created_date);
                        const diffMs = now - created;
                        const diffMins = Math.floor(diffMs / 60000);
                        if (diffMins < 1) return 'Just now';
                        if (diffMins < 60) return `${diffMins}m ago`;
                        const diffHours = Math.floor(diffMins / 60);
                        if (diffHours < 24) return `${diffHours}h ago`;
                        return `${Math.floor(diffHours / 24)}d ago`;
                      })()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top Performing Users */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Users (Last 7 Days)</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {(() => {
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              const recentStats = allStats.filter(s => new Date(s.created_date) > weekAgo);
              const userStats = {};
              
              recentStats.forEach(stat => {
                if (!userStats[stat.created_by]) {
                  userStats[stat.created_by] = { count: 0, saved: 0 };
                }
                userStats[stat.created_by].count++;
                const saved = stat.original_size - stat.compressed_size;
                userStats[stat.created_by].saved += Math.max(0, saved);
              });

              return Object.entries(userStats)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 10)
                .map(([email, stats], idx) => {
                  const user = users.find(u => u.email === email);
                  return (
                    <div key={email} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer" onClick={() => user && setSelectedUser(user)}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{user?.full_name || email}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {stats.count} files • {formatBytes(stats.saved)}
                          </p>
                          {user?.plan === 'pro' && (
                            <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0">PRO</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
            })()}
          </div>
        </Card>
      </div>

      {/* Format Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Popular Formats (Last 24h)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {(() => {
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentStats = allStats.filter(s => new Date(s.created_date) > dayAgo);
            const formatCounts = {};
            
            recentStats.forEach(stat => {
              const format = stat.output_format.toUpperCase();
              formatCounts[format] = (formatCounts[format] || 0) + 1;
            });

            return Object.entries(formatCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([format, count]) => (
                <div key={format} className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{count}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{format}</p>
                </div>
              ));
          })()}
        </div>
      </Card>

      {/* Top Users by Files Processed */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Users by Activity</h3>
        <div className="space-y-2">
          {(() => {
            const userStats = {};
            allStats.forEach(stat => {
              if (!userStats[stat.created_by]) {
                userStats[stat.created_by] = { count: 0, saved: 0 };
              }
              userStats[stat.created_by].count++;
              const saved = stat.original_size - stat.compressed_size;
              userStats[stat.created_by].saved += Math.max(0, saved);
            });

            return Object.entries(userStats)
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 10)
              .map(([email, stats]) => (
                <div key={email} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{email}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {stats.count} files • {formatBytes(stats.saved)} saved
                    </p>
                  </div>
                  <Badge variant="outline">{stats.count}</Badge>
                </div>
              ));
          })()}
        </div>
      </Card>
    </div>
  );
}