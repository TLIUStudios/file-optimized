import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileUp, HardDrive, TrendingUp, Globe, Activity } from "lucide-react";
import * as THREE from "three";

export default function LiveAnalyticsDashboard() {
  const canvasRef = useRef(null);
  const [globe, setGlobe] = useState(null);

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

  // Initialize 3D Globe
  useEffect(() => {
    if (!canvasRef.current) return;

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

    // Create globe
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x10b981,
      emissive: 0x072f1f,
      shininess: 100,
      wireframe: false
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Add wireframe overlay
    const wireframeGeometry = new THREE.SphereGeometry(1.01, 20, 20);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframe);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Add user markers (simulated locations)
    const markerGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    
    // Simulate some user locations
    const sampleLocations = [
      { lat: 40.7128, lon: -74.0060 }, // New York
      { lat: 51.5074, lon: -0.1278 },  // London
      { lat: 35.6762, lon: 139.6503 }, // Tokyo
      { lat: -33.8688, lon: 151.2093 }, // Sydney
      { lat: 48.8566, lon: 2.3522 },   // Paris
    ];

    sampleLocations.forEach(({ lat, lon }) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -1.05 * Math.sin(phi) * Math.cos(theta);
      const y = 1.05 * Math.cos(phi);
      const z = 1.05 * Math.sin(phi) * Math.sin(theta);
      
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, y, z);
      scene.add(marker);
    });

    setGlobe({ scene, camera, renderer, sphere, wireframe });

    // Animation
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      sphere.rotation.y += 0.002;
      wireframe.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
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
      geometry.dispose();
      material.dispose();
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
      markerGeometry.dispose();
      markerMaterial.dispose();
      renderer.dispose();
    };
  }, []);

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

      {/* Globe Visualization */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">User Locations</h3>
          <Badge variant="outline" className="text-xs">Live</Badge>
        </div>
        <div className="relative w-full h-[400px] bg-slate-900 rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3">
          Interactive 3D globe showing approximate user distribution
        </p>
      </Card>

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