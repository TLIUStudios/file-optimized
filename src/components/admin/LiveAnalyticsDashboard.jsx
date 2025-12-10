import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileUp, HardDrive, TrendingUp, Globe, Activity, X, ExternalLink, Crown, Calendar, Mail } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export default function LiveAnalyticsDashboard() {
  const canvasRef = useRef(null);
  const [globe, setGlobe] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const controlsRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const markersRef = useRef([]);

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
    refetchInterval: 30000
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
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true
    });
    
    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;
    renderer.setSize(width, height);
    camera.position.z = 3;

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

    // Create globe
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0x10b981,
      emissive: 0x072f1f,
      shininess: 100,
      wireframe: false,
      transparent: true,
      opacity: 0.95
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Add wireframe overlay
    const wireframeGeometry = new THREE.SphereGeometry(1.01, 24, 24);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframe);

    // Add atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(1.15, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, -3, -5);
    scene.add(pointLight);

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
      if (!canvasRef.current) return;
      const newWidth = canvasRef.current.clientWidth;
      const newHeight = canvasRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
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
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      markerGeometry.dispose();
      markerMaterialNormal.dispose();
      markerMaterialHovered.dispose();
      markerMaterialPro.dispose();
      markers.forEach(m => m.geometry?.dispose());
      controls.dispose();
      renderer.dispose();
    };
  }, [users]);

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Interactive User Globe</h3>
            <Badge variant="outline" className="text-xs">Live</Badge>
          </div>
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
        <div className="relative w-full h-[500px] bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg overflow-hidden shadow-2xl border border-slate-800">
          <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          
          {/* Hover tooltip */}
          {hoveredMarker && (
            <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl pointer-events-none">
              <p className="text-xs font-medium text-white">{hoveredMarker.userData.user.full_name || 'User'}</p>
              <p className="text-xs text-slate-400">{hoveredMarker.userData.user.email}</p>
              {hoveredMarker.userData.user.plan === 'pro' && (
                <Badge className="mt-1 bg-amber-500 text-white text-[10px]">PRO</Badge>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2">
            <p className="text-xs text-slate-300 text-center">
              🖱️ Drag to rotate • 🔍 Scroll to zoom • 👆 Click markers for details
            </p>
          </div>

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-slate-300">Free User</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <span className="text-xs text-slate-300">Pro User</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3">
          Real-time 3D visualization of {totalUsers} users • Click any marker to view detailed information
        </p>
      </Card>

      {/* Selected User Detail Panel */}
      {selectedUser && (
        <Card className="p-6 border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold">
                {selectedUser.full_name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.full_name || 'User'}</h3>
                  {selectedUser.plan === 'pro' && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      PRO
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 mt-1">
                  <Mail className="w-3 h-3" />
                  {selectedUser.email}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedUser(null)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">Member Since</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {new Date(selectedUser.created_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FileUp className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">Files Processed</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {allStats.filter(s => s.created_by === selectedUser.email).length}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <HardDrive className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">Space Saved</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {formatBytes(
                  allStats
                    .filter(s => s.created_by === selectedUser.email)
                    .reduce((sum, stat) => sum + Math.max(0, stat.original_size - stat.compressed_size), 0)
                )}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">Account Status</span>
              </div>
              <Badge variant={selectedUser.plan === 'pro' ? 'default' : 'outline'} className="text-xs">
                {selectedUser.plan === 'pro' ? 'PRO' : 'FREE'}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`mailto:${selectedUser.email}`, '_blank')}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email User
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                // Copy user ID to clipboard
                navigator.clipboard.writeText(selectedUser.id);
                alert('User ID copied to clipboard!');
              }}
            >
              Copy User ID
            </Button>
          </div>
        </Card>
      )}

      {/* Recent Users */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Users</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {users.slice(0, 20).map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white truncate">{user.full_name || 'User'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {user.plan === 'pro' && (
                  <Badge className="bg-amber-500 text-white text-xs">PRO</Badge>
                )}
                <p className="text-xs text-slate-500">
                  {new Date(user.created_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
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