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
  const globeInitializedRef = useRef(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [hoveredDisaster, setHoveredDisaster] = useState(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const userMarkersRef = useRef([]);
  const [globeStyle, setGlobeStyle] = useState('earth');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const labelsRef = useRef([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const disasterMarkersRef = useRef([]);
  const [weatherData, setWeatherData] = useState([]);
  const weatherMarkersRef = useRef([]);
  const tempMarkersRef = useRef([]);
  const [activeLayers, setActiveLayers] = useState({
    users: true,
    disasters: true,
    weather: true
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isGlobeLoading, setIsGlobeLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [issPosition, setIssPosition] = useState(null);
  const issMarkerRef = useRef(null);
  const issOrbitRef = useRef(null);
  const [showTempLayer, setShowTempLayer] = useState(false);
  const [aqiData, setAqiData] = useState([]);
  const aqiMarkersRef = useRef([]);

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
    refetchInterval: 30000
  });

  // Fetch compression stats
  const { data: allStats = [] } = useQuery({
    queryKey: ['admin-all-stats'],
    queryFn: () => base44.entities.CompressionStat.list('-created_date', 10000),
    refetchInterval: 5000,
    onSuccess: (newStats) => {
      if (newStats.length > 0) {
        setRecentActivity(newStats.slice(0, 15));
      }
    }
  });

  // Fetch real-time data
  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const disasters = [];
        
        // Earthquakes
        try {
          const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson');
          const data = await res.json();
          data.features?.slice(0, 50).forEach(eq => {
            disasters.push({
              type: 'earthquake',
              lat: eq.geometry.coordinates[1],
              lon: eq.geometry.coordinates[0],
              magnitude: eq.properties.mag,
              place: eq.properties.place,
              time: eq.properties.time
            });
          });
        } catch (e) { console.error('Earthquake fetch failed:', e); }

        setDisasters(disasters);
      } catch (error) {
        console.error('Error fetching disaster data:', error);
      }
    };

    const fetchWeather = async () => {
      try {
        const weather = [];
        const cities = [
          { name: 'New York', lat: 40.7, lon: -74 },
          { name: 'Los Angeles', lat: 34.05, lon: -118.25 },
          { name: 'London', lat: 51.5, lon: -0.1 },
          { name: 'Paris', lat: 48.86, lon: 2.35 },
          { name: 'Tokyo', lat: 35.6, lon: 139.6 },
          { name: 'Beijing', lat: 39.9, lon: 116.4 },
          { name: 'Shanghai', lat: 31.23, lon: 121.47 },
          { name: 'Mumbai', lat: 19.08, lon: 72.88 },
          { name: 'São Paulo', lat: -23.55, lon: -46.63 },
          { name: 'Sydney', lat: -33.8, lon: 151.2 },
          { name: 'Moscow', lat: 55.75, lon: 37.62 },
          { name: 'Dubai', lat: 25.2, lon: 55.2 },
          { name: 'Singapore', lat: 1.3, lon: 103.8 },
          { name: 'Cairo', lat: 30.04, lon: 31.24 },
          { name: 'Mexico City', lat: 19.43, lon: -99.13 },
          { name: 'Toronto', lat: 43.65, lon: -79.38 },
          { name: 'Berlin', lat: 52.52, lon: 13.4 },
          { name: 'Rome', lat: 41.9, lon: 12.5 },
          { name: 'Madrid', lat: 40.42, lon: -3.7 },
          { name: 'Bangkok', lat: 13.76, lon: 100.5 },
          { name: 'Seoul', lat: 37.57, lon: 126.98 },
          { name: 'Jakarta', lat: -6.21, lon: 106.85 },
          { name: 'Manila', lat: 14.6, lon: 120.98 },
          { name: 'Buenos Aires', lat: -34.6, lon: -58.38 },
          { name: 'Lagos', lat: 6.52, lon: 3.38 },
          { name: 'Johannesburg', lat: -26.2, lon: 28.05 },
          { name: 'Istanbul', lat: 41.01, lon: 28.98 },
          { name: 'Chicago', lat: 41.88, lon: -87.63 },
          { name: 'Miami', lat: 25.76, lon: -80.19 },
          { name: 'Vancouver', lat: 49.28, lon: -123.12 }
        ];

        for (const city of cities) {
          try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,precipitation,cloud_cover,wind_speed_10m,pressure_msl&timezone=auto`);
            const data = await res.json();
            weather.push({
              ...city,
              temp: data.current?.temperature_2m,
              precipitation: data.current?.precipitation,
              clouds: data.current?.cloud_cover,
              windSpeed: data.current?.wind_speed_10m,
              pressure: data.current?.pressure_msl
            });
          } catch (e) { console.error(`Weather fetch failed for ${city.name}:`, e); }
        }

        setWeatherData(weather);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    const fetchISS = async () => {
      try {
        const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        const data = await res.json();
        setIssPosition({ lat: data.latitude, lon: data.longitude, altitude: data.altitude });
      } catch (e) { console.error('ISS fetch failed:', e); }
    };

    const fetchAQI = async () => {
      try {
        const cities = [
          { name: 'Beijing', lat: 39.9, lon: 116.4 },
          { name: 'Delhi', lat: 28.7, lon: 77.1 },
          { name: 'Los Angeles', lat: 34.05, lon: -118.25 },
          { name: 'London', lat: 51.5, lon: -0.1 },
          { name: 'Tokyo', lat: 35.6, lon: 139.6 },
          { name: 'Mumbai', lat: 19.08, lon: 72.88 },
          { name: 'São Paulo', lat: -23.55, lon: -46.63 },
          { name: 'Cairo', lat: 30.04, lon: 31.24 }
        ];
        
        const aqiResults = [];
        for (const city of cities) {
          try {
            const res = await fetch(`https://api.waqi.info/feed/geo:${city.lat};${city.lon}/?token=demo`);
            const data = await res.json();
            if (data.status === 'ok') {
              aqiResults.push({
                ...city,
                aqi: data.data.aqi,
                dominant: data.data.dominentpol
              });
            }
          } catch (e) { console.error(`AQI fetch failed for ${city.name}:`, e); }
        }
        setAqiData(aqiResults);
      } catch (error) {
        console.error('Error fetching AQI data:', error);
      }
    };

    fetchDisasters();
    fetchWeather();
    fetchISS();
    fetchAQI();
    const disasterInterval = setInterval(fetchDisasters, 300000);
    const weatherInterval = setInterval(fetchWeather, 600000);
    const issInterval = setInterval(fetchISS, 5000);
    const aqiInterval = setInterval(fetchAQI, 1800000);
    return () => {
      clearInterval(disasterInterval);
      clearInterval(weatherInterval);
      clearInterval(issInterval);
      clearInterval(aqiInterval);
    };
  }, []);

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

  // Initialize 3D Globe - ONLY ONCE
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || users.length === 0 || globeInitializedRef.current) return;

    globeInitializedRef.current = true;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Starfield
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 15000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = radius * Math.cos(phi);
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.set(0, 0, 3.2);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 1.8;
    controls.maxDistance = 5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enablePan = false;
    controlsRef.current = controls;

    // Create Globe
    const geometry = new THREE.SphereGeometry(1, 256, 256);
    let material;
    if (globeStyle === 'earth') {
      const textureLoader = new THREE.TextureLoader();
      const earthTexture = textureLoader.load('https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg');
      const bumpTexture = textureLoader.load('https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png');
      material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: bumpTexture,
        bumpScale: 0.02,
        shininess: 20,
        specular: new THREE.Color(0x444444)
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        metalness: 0.3,
        roughness: 0.5,
        emissive: 0x059669,
        emissiveIntensity: 0.3
      });
    }
    const sphere = new THREE.Mesh(geometry, material);
    sphere.userData = { isSphere: true };
    sphere.scale.set(0.8, 0.8, 0.8);
    scene.add(sphere);
    
    // Clouds
    const cloudGeometry = new THREE.SphereGeometry(1.01, 128, 128);
    const cloudTexture = new THREE.TextureLoader().load('https://unpkg.com/three-globe@2.31.1/example/img/earth-water.png');
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: globeStyle === 'earth' ? 0.15 : 0,
      depthWrite: false
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);

    // Atmosphere
    const atmosphereGeometry1 = new THREE.SphereGeometry(1.08, 64, 64);
    const atmosphereColor = globeStyle === 'earth' ? 0x4a9eff : 0x34d399;
    const atmosphereMaterial1 = new THREE.MeshBasicMaterial({
      color: atmosphereColor,
      transparent: true,
      opacity: globeStyle === 'earth' ? 0.15 : 0.12,
      side: THREE.BackSide
    });
    const atmosphere1 = new THREE.Mesh(atmosphereGeometry1, atmosphereMaterial1);
    scene.add(atmosphere1);
    
    const atmosphereGeometry2 = new THREE.SphereGeometry(1.15, 64, 64);
    const atmosphereMaterial2 = new THREE.MeshBasicMaterial({
      color: atmosphereColor,
      transparent: true,
      opacity: globeStyle === 'earth' ? 0.08 : 0.06,
      side: THREE.BackSide
    });
    const atmosphere2 = new THREE.Mesh(atmosphereGeometry2, atmosphereMaterial2);
    scene.add(atmosphere2);

    // Sun position calculation
    const calculateSunPosition = () => {
      const now = new Date();
      const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
      const declination = 23.45 * Math.sin((360/365) * (dayOfYear - 81) * Math.PI / 180);
      const hours = now.getUTCHours();
      const minutes = now.getUTCMinutes();
      const seconds = now.getUTCSeconds();
      const timeDecimal = hours + minutes/60 + seconds/3600;
      const longitude = (timeDecimal - 12) * 15;
      return { lat: declination, lon: longitude };
    };

    const sunPos = calculateSunPosition();
    const sunPhi = (90 - sunPos.lat) * (Math.PI / 180);
    const sunTheta = (sunPos.lon + 180) * (Math.PI / 180);
    const sunDirection = new THREE.Vector3(
      -Math.sin(sunPhi) * Math.cos(sunTheta),
      Math.cos(sunPhi),
      Math.sin(sunPhi) * Math.sin(sunTheta)
    );

    // Terminator (day/night)
    const terminatorGeometry = new THREE.SphereGeometry(1.002, 128, 128);
    const terminatorMaterial = new THREE.ShaderMaterial({
      uniforms: { sunDirection: { value: sunDirection.clone() } },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 sunDirection;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float intensity = dot(normalize(vPosition), sunDirection);
          float dayNight = smoothstep(-0.1, 0.1, intensity);
          vec3 nightColor = vec3(0.05, 0.05, 0.15);
          vec3 dayColor = vec3(0.0, 0.0, 0.0);
          vec3 color = mix(nightColor, dayColor, dayNight);
          gl_FragColor = vec4(color, 0.4);
        }
      `,
      transparent: true,
      side: THREE.FrontSide
    });
    const terminator = new THREE.Mesh(terminatorGeometry, terminatorMaterial);
    scene.add(terminator);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, globeStyle === 'earth' ? 0.4 : 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, globeStyle === 'earth' ? 1.2 : 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Labels - ALL worldwide locations
    const createLabel = (text, lat, lon, zoomLevel, priority = 1, isCapital = false) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const radius = 1.01;
      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 1024;
      canvas.height = 256;
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      let fontSize, fontWeight, isItalic;
      if (zoomLevel === 1) { fontSize = 48; fontWeight = 'italic'; isItalic = true; }
      else if (zoomLevel === 2) { fontSize = 56; fontWeight = 'bold'; }
      else if (zoomLevel === 3) { fontSize = 44; fontWeight = '600'; }
      else { fontSize = 36; fontWeight = 'normal'; }

      context.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      // Gold star for capitals
      if (isCapital) {
        const starSize = fontSize * 0.4;
        const textWidth = context.measureText(text).width;
        const starX = canvas.width / 2 - textWidth / 2 - starSize - 10;
        const starY = canvas.height / 2;
        context.fillStyle = '#ffd700';
        context.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? starSize : starSize / 2;
          const px = starX + Math.cos(angle) * r;
          const py = starY + Math.sin(angle) * r;
          if (i === 0) context.moveTo(px, py);
          else context.lineTo(px, py);
        }
        context.closePath();
        context.fill();
      }

      context.lineWidth = 6;
      context.strokeStyle = globeStyle === 'earth' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 20, 10, 0.9)';
      context.strokeText(text, canvas.width / 2, canvas.height / 2);
      context.fillStyle = globeStyle === 'earth' ? (isItalic ? '#88ccff' : '#ffffff') : (isItalic ? '#34d399' : '#10b981');
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0, depthTest: false });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x, y, z);
      const scaleMap = { 1: { w: 1.0, h: 0.25 }, 2: { w: 0.7, h: 0.175 }, 3: { w: 0.5, h: 0.125 } };
      const scale = scaleMap[zoomLevel] || { w: 0.4, h: 0.1 };
      sprite.scale.set(scale.w, scale.h, 1);
      sprite.userData = { isLabel: true, zoomLevel, priority, text, lat, lon };
      sphere.add(sprite);
      return sprite;
    };

    // All worldwide locations with capitals marked
    const labels = [];
    if (showLabels) {
      const locations = [
        // Oceans
        { name: 'Pacific Ocean', lat: 0, lon: -160, ocean: true, zoom: 1 },
        { name: 'Atlantic Ocean', lat: 15, lon: -30, ocean: true, zoom: 1 },
        { name: 'Indian Ocean', lat: -20, lon: 80, ocean: true, zoom: 1 },
        { name: 'Arctic Ocean', lat: 75, lon: 0, ocean: true, zoom: 1 },
        { name: 'Southern Ocean', lat: -60, lon: 0, ocean: true, zoom: 1 },
        
        // Countries - Global
        { name: 'United States', lat: 39, lon: -95, zoom: 2 },
        { name: 'Canada', lat: 56, lon: -106, zoom: 2 },
        { name: 'Mexico', lat: 23, lon: -102, zoom: 2 },
        { name: 'Brazil', lat: -10, lon: -55, zoom: 2 },
        { name: 'Argentina', lat: -34, lon: -64, zoom: 2 },
        { name: 'Chile', lat: -30, lon: -71, zoom: 2 },
        { name: 'Colombia', lat: 4, lon: -72, zoom: 2 },
        { name: 'Peru', lat: -10, lon: -76, zoom: 2 },
        { name: 'United Kingdom', lat: 54, lon: -2, zoom: 2 },
        { name: 'France', lat: 47, lon: 2, zoom: 2 },
        { name: 'Germany', lat: 51, lon: 10, zoom: 2 },
        { name: 'Spain', lat: 40, lon: -4, zoom: 2 },
        { name: 'Italy', lat: 42, lon: 12, zoom: 2 },
        { name: 'Poland', lat: 52, lon: 20, zoom: 2 },
        { name: 'Ukraine', lat: 49, lon: 32, zoom: 2 },
        { name: 'Russia', lat: 60, lon: 100, zoom: 2 },
        { name: 'China', lat: 35, lon: 105, zoom: 2 },
        { name: 'India', lat: 20, lon: 77, zoom: 2 },
        { name: 'Japan', lat: 36, lon: 138, zoom: 2 },
        { name: 'South Korea', lat: 37, lon: 127.5, zoom: 2 },
        { name: 'Australia', lat: -25, lon: 133, zoom: 2 },
        { name: 'New Zealand', lat: -41, lon: 174, zoom: 2 },
        { name: 'South Africa', lat: -29, lon: 24, zoom: 2 },
        { name: 'Egypt', lat: 26, lon: 30, zoom: 2 },
        { name: 'Nigeria', lat: 9, lon: 8, zoom: 2 },
        { name: 'Kenya', lat: 1, lon: 38, zoom: 2 },
        { name: 'Indonesia', lat: -2, lon: 118, zoom: 2 },
        { name: 'Thailand', lat: 15, lon: 100, zoom: 2 },
        { name: 'Vietnam', lat: 16, lon: 106, zoom: 2 },
        { name: 'Philippines', lat: 13, lon: 122, zoom: 2 },
        { name: 'Turkey', lat: 39, lon: 35, zoom: 2 },
        { name: 'Saudi Arabia', lat: 24, lon: 45, zoom: 2 },
        { name: 'Iran', lat: 32, lon: 53, zoom: 2 },
        { name: 'Pakistan', lat: 30, lon: 70, zoom: 2 },
        { name: 'Bangladesh', lat: 24, lon: 90, zoom: 2 },
        { name: 'Sweden', lat: 62, lon: 15, zoom: 2 },
        { name: 'Norway', lat: 60.5, lon: 8.5, zoom: 2 },
        { name: 'Finland', lat: 64, lon: 26, zoom: 2 },
        
        // ALL US States with capital stars
        { name: 'California', lat: 36.7, lon: -119.7, zoom: 3, capital: true },
        { name: 'Texas', lat: 31, lon: -100, zoom: 3, capital: true },
        { name: 'Florida', lat: 27.6, lon: -81.5, zoom: 3, capital: true },
        { name: 'New York', lat: 43, lon: -75, zoom: 3, capital: true },
        { name: 'Pennsylvania', lat: 41, lon: -77.5, zoom: 3, capital: true },
        { name: 'Illinois', lat: 40, lon: -89, zoom: 3, capital: true },
        { name: 'Ohio', lat: 40.4, lon: -82.9, zoom: 3, capital: true },
        { name: 'Georgia', lat: 33, lon: -83.5, zoom: 3, capital: true },
        { name: 'North Carolina', lat: 35.5, lon: -80, zoom: 3, capital: true },
        { name: 'Michigan', lat: 44.3, lon: -85.6, zoom: 3, capital: true },
        { name: 'New Jersey', lat: 40, lon: -74.5, zoom: 3, capital: true },
        { name: 'Virginia', lat: 37.5, lon: -78.6, zoom: 3, capital: true },
        { name: 'Washington', lat: 47.5, lon: -120.5, zoom: 3, capital: true },
        { name: 'Arizona', lat: 34.3, lon: -111.7, zoom: 3, capital: true },
        { name: 'Massachusetts', lat: 42.4, lon: -71.4, zoom: 3, capital: true },
        { name: 'Tennessee', lat: 36, lon: -86, zoom: 3, capital: true },
        { name: 'Indiana', lat: 40, lon: -86.3, zoom: 3, capital: true },
        { name: 'Missouri', lat: 38.5, lon: -92.5, zoom: 3, capital: true },
        { name: 'Maryland', lat: 39, lon: -76.8, zoom: 3, capital: true },
        { name: 'Wisconsin', lat: 44.5, lon: -90, zoom: 3, capital: true },
        { name: 'Colorado', lat: 39, lon: -105.5, zoom: 3, capital: true },
        { name: 'Minnesota', lat: 46, lon: -94.5, zoom: 3, capital: true },
        { name: 'South Carolina', lat: 34, lon: -81, zoom: 3, capital: true },
        { name: 'Alabama', lat: 32.8, lon: -86.9, zoom: 3, capital: true },
        { name: 'Louisiana', lat: 31, lon: -92, zoom: 3, capital: true },
        { name: 'Kentucky', lat: 37.5, lon: -85, zoom: 3, capital: true },
        { name: 'Oregon', lat: 44, lon: -120.5, zoom: 3, capital: true },
        { name: 'Oklahoma', lat: 36, lon: -97.5, zoom: 3, capital: true },
        { name: 'Connecticut', lat: 41.6, lon: -72.7, zoom: 3, capital: true },
        { name: 'Utah', lat: 39.5, lon: -111.5, zoom: 3, capital: true },
        { name: 'Iowa', lat: 42, lon: -93.5, zoom: 3, capital: true },
        { name: 'Nevada', lat: 39, lon: -117, zoom: 3, capital: true },
        { name: 'Arkansas', lat: 35, lon: -92.4, zoom: 3, capital: true },
        { name: 'Mississippi', lat: 33, lon: -90, zoom: 3, capital: true },
        { name: 'Kansas', lat: 38.5, lon: -98, zoom: 3, capital: true },
        { name: 'New Mexico', lat: 34.5, lon: -106, zoom: 3, capital: true },
        { name: 'Nebraska', lat: 41.5, lon: -99.9, zoom: 3, capital: true },
        { name: 'Idaho', lat: 44.5, lon: -114.5, zoom: 3, capital: true },
        { name: 'Hawaii', lat: 20.5, lon: -157, zoom: 3, capital: true },
        { name: 'West Virginia', lat: 38.5, lon: -80.5, zoom: 3, capital: true },
        { name: 'New Hampshire', lat: 44, lon: -71.5, zoom: 3, capital: true },
        { name: 'Maine', lat: 45, lon: -69, zoom: 3, capital: true },
        { name: 'Montana', lat: 47, lon: -110, zoom: 3, capital: true },
        { name: 'Rhode Island', lat: 41.7, lon: -71.5, zoom: 3, capital: true },
        { name: 'Delaware', lat: 39, lon: -75.5, zoom: 3, capital: true },
        { name: 'South Dakota', lat: 44.5, lon: -100, zoom: 3, capital: true },
        { name: 'North Dakota', lat: 47.5, lon: -100.5, zoom: 3, capital: true },
        { name: 'Alaska', lat: 64, lon: -153, zoom: 3, capital: true },
        { name: 'Vermont', lat: 44, lon: -72.7, zoom: 3, capital: true },
        { name: 'Wyoming', lat: 43, lon: -107.5, zoom: 3, capital: true },
        
        // Canadian Provinces with capitals
        { name: 'Ontario', lat: 50, lon: -85, zoom: 3, capital: true },
        { name: 'Quebec', lat: 52, lon: -70, zoom: 3, capital: true },
        { name: 'British Columbia', lat: 54, lon: -125, zoom: 3, capital: true },
        { name: 'Alberta', lat: 55, lon: -115, zoom: 3, capital: true },
        { name: 'Manitoba', lat: 55, lon: -98, zoom: 3, capital: true },
        { name: 'Saskatchewan', lat: 55, lon: -106, zoom: 3, capital: true },
        
        // Australian States with capitals
        { name: 'New South Wales', lat: -32, lon: 147, zoom: 3, capital: true },
        { name: 'Victoria', lat: -37, lon: 144, zoom: 3, capital: true },
        { name: 'Queensland', lat: -20, lon: 145, zoom: 3, capital: true },
        { name: 'Western Australia', lat: -25, lon: 122, zoom: 3, capital: true },
        { name: 'South Australia', lat: -30, lon: 135, zoom: 3, capital: true },
        
        // Chinese Provinces with capitals
        { name: 'Guangdong', lat: 23.4, lon: 113.4, zoom: 3, capital: true },
        { name: 'Sichuan', lat: 30.6, lon: 103.7, zoom: 3, capital: true },
        { name: 'Zhejiang', lat: 29.5, lon: 120.0, zoom: 3, capital: true },
        { name: 'Jiangsu', lat: 32.97, lon: 119.46, zoom: 3, capital: true },
        
        // Indian States with capitals
        { name: 'Maharashtra', lat: 19.8, lon: 75.5, zoom: 3, capital: true },
        { name: 'Karnataka', lat: 15.3, lon: 75.7, zoom: 3, capital: true },
        { name: 'Tamil Nadu', lat: 11, lon: 78.5, zoom: 3, capital: true },
        { name: 'Uttar Pradesh', lat: 27, lon: 80.5, zoom: 3, capital: true },
        
        // Brazilian States with capitals
        { name: 'São Paulo State', lat: -23, lon: -48, zoom: 3, capital: true },
        { name: 'Rio de Janeiro State', lat: -22, lon: -43, zoom: 3, capital: true },
        { name: 'Minas Gerais', lat: -18.5, lon: -44, zoom: 3, capital: true },
        
        // Mexican States with capitals
        { name: 'Jalisco', lat: 20.66, lon: -103.35, zoom: 3, capital: true },
        { name: 'Nuevo León', lat: 25.59, lon: -99.99, zoom: 3, capital: true },
        { name: 'Veracruz', lat: 19.54, lon: -96.91, zoom: 3, capital: true },
        
        // European Regions with capitals
        { name: 'Bavaria', lat: 48.79, lon: 11.5, zoom: 3, capital: true },
        { name: 'Catalonia', lat: 41.59, lon: 1.52, zoom: 3, capital: true },
        { name: 'Île-de-France', lat: 48.85, lon: 2.35, zoom: 3, capital: true },
        { name: 'Lombardy', lat: 45.58, lon: 9.27, zoom: 3, capital: true },
        
        // Russian Regions with capitals
        { name: 'Moscow Oblast', lat: 55.5, lon: 37.5, zoom: 3, capital: true },
        { name: 'Saint Petersburg', lat: 60, lon: 30.5, zoom: 3, capital: true },
        { name: 'Siberia', lat: 60, lon: 105, zoom: 3, capital: true },
        
        // Japanese Prefectures with capitals
        { name: 'Tokyo Prefecture', lat: 35.68, lon: 139.69, zoom: 3, capital: true },
        { name: 'Osaka Prefecture', lat: 34.69, lon: 135.5, zoom: 3, capital: true },
        
        // Poles
        { name: 'North Pole', lat: 90, lon: 0, zoom: 2, priority: 2 },
        { name: 'South Pole', lat: -90, lon: 0, zoom: 2, priority: 2 },
        { name: 'Greenland', lat: 72, lon: -40, zoom: 2 },
        { name: 'Iceland', lat: 65, lon: -18, zoom: 2 },
      ];

      locations.forEach(loc => {
        const label = createLabel(loc.name, loc.lat, loc.lon, loc.zoom || 2, loc.priority || 1, loc.capital || false);
        label.userData.isOcean = loc.ocean || false;
        labels.push(label);
      });
    }
    labelsRef.current = labels;

    // User markers
    const locationClusters = [
      { lat: 40.7128, lon: -74.0060, count: Math.floor(users.length * 0.15) },
      { lat: 34.0522, lon: -118.2437, count: Math.floor(users.length * 0.1) },
      { lat: 51.5074, lon: -0.1278, count: Math.floor(users.length * 0.12) },
      { lat: 48.8566, lon: 2.3522, count: Math.floor(users.length * 0.08) },
      { lat: 35.6762, lon: 139.6503, count: Math.floor(users.length * 0.15) },
      { lat: 31.2304, lon: 121.4737, count: Math.floor(users.length * 0.1) },
      { lat: 19.0760, lon: 72.8777, count: Math.floor(users.length * 0.07) },
      { lat: -33.8688, lon: 151.2093, count: Math.floor(users.length * 0.04) },
    ];

    const markers = [];
    const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
    let userIndex = 0;
    locationClusters.forEach(cluster => {
      const usersInCluster = Math.min(cluster.count, users.length - userIndex);
      for (let i = 0; i < usersInCluster; i++) {
        if (userIndex >= users.length) break;
        const user = users[userIndex++];
        const lat = cluster.lat + (Math.random() - 0.5) * 10;
        const lon = cluster.lon + (Math.random() - 0.5) * 10;
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const radius = 1.05;
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        const isPro = user.plan === 'pro';
        const material = new THREE.MeshPhongMaterial({ 
          color: isPro ? 0xf59e0b : 0x10b981,
          emissive: isPro ? 0xf59e0b : 0x10b981,
          emissiveIntensity: isPro ? 0.8 : 0.5,
          shininess: 100
        });
        const marker = new THREE.Mesh(markerGeometry, material);
        marker.position.set(x, y, z);
        marker.userData = { user, isMarker: true, pulsePhase: isPro ? Math.random() * Math.PI * 2 : 0 };
        scene.add(marker);
        markers.push(marker);
      }
    });
    userMarkersRef.current = markers;

    // Mouse handlers
    const handleMouseMove = (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      const userIntersects = raycasterRef.current.intersectObjects(markers);
      if (userIntersects.length > 0 && userIntersects[0].object.userData.isMarker) {
        setSelectedUser(userIntersects[0].object.userData.user);
        controls.autoRotate = false;
        return;
      }
      
      const disasterIntersects = raycasterRef.current.intersectObjects(disasterMarkersRef.current);
      if (disasterIntersects.length > 0 && disasterIntersects[0].object.userData.isDisaster) {
        const disaster = disasterIntersects[0].object.userData.disaster;
        setSelectedLocation({ type: 'disaster', data: disaster, lat: disaster.lat, lon: disaster.lon });
        controls.autoRotate = false;
        return;
      }
      
      const weatherIntersects = raycasterRef.current.intersectObjects(weatherMarkersRef.current);
      if (weatherIntersects.length > 0 && weatherIntersects[0].object.userData.isWeather) {
        const weather = weatherIntersects[0].object.userData.weather;
        setSelectedLocation({ type: 'weather', data: weather, lat: weather.lat, lon: weather.lon });
        controls.autoRotate = false;
        return;
      }
    };

    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('click', handleClick);

    // Animation loop
    let animationId;
    let animationTime = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      animationTime += 0.016;
      
      // Entry animation
      if (animationTime < 1.5) {
        const progress = Math.min(animationTime / 1.5, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        sphere.scale.set(0.8 + easeProgress * 0.2, 0.8 + easeProgress * 0.2, 0.8 + easeProgress * 0.2);
        atmosphere1.scale.set(easeProgress, easeProgress, easeProgress);
        atmosphere2.scale.set(easeProgress, easeProgress, easeProgress);
      }
      
      controls.update();
      
      // Animate clouds
      if (clouds && globeStyle === 'earth') {
        clouds.rotation.y += 0.0002;
      }
      
      // Update sun/terminator
      const sunPos = calculateSunPosition();
      const sunPhi = (90 - sunPos.lat) * (Math.PI / 180);
      const sunTheta = (sunPos.lon + 180) * (Math.PI / 180);
      const newSunDirection = new THREE.Vector3(
        -Math.sin(sunPhi) * Math.cos(sunTheta),
        Math.cos(sunPhi),
        Math.sin(sunPhi) * Math.sin(sunTheta)
      );
      terminator.material.uniforms.sunDirection.value.copy(newSunDirection);
      
      // Update ISS
      if (issMarkerRef.current && issPosition) {
        const phi = (90 - issPosition.lat) * (Math.PI / 180);
        const theta = (issPosition.lon + 180) * (Math.PI / 180);
        const radius = 1.1;
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        issMarkerRef.current.position.set(x, y, z);
        const scale = 1 + Math.sin(animationTime * 3) * 0.3;
        issMarkerRef.current.scale.set(scale, scale, scale);
      }
      
      // Label visibility (intelligent zoom-based)
      const cameraDistance = camera.position.distanceTo(scene.position);
      if (showLabels) {
        labelsRef.current.forEach(label => {
          const zoomLevel = label.userData.zoomLevel;
          let shouldShow = false;
          if (label.userData.isOcean) shouldShow = cameraDistance > 3.8;
          else if (zoomLevel === 2) shouldShow = cameraDistance > 2.6;
          else if (zoomLevel === 3) shouldShow = cameraDistance <= 2.8;
          
          if (shouldShow) {
            const labelPos = new THREE.Vector3();
            label.getWorldPosition(labelPos);
            const dirToCamera = new THREE.Vector3().subVectors(camera.position, labelPos).normalize();
            const labelNormal = labelPos.clone().normalize();
            const dot = dirToCamera.dot(labelNormal);
            if (dot > 0.3) {
              label.material.opacity += (0.95 - label.material.opacity) * 0.15;
            } else {
              label.material.opacity *= 0.85;
            }
          } else {
            label.material.opacity *= 0.85;
          }
        });
      } else {
        labelsRef.current.forEach(label => { label.material.opacity *= 0.9; });
      }

      // Pulse disasters
      disasterMarkersRef.current.forEach(marker => {
        marker.userData.pulsePhase += 0.08;
        const scale = 1 + Math.sin(marker.userData.pulsePhase) * 0.5;
        marker.scale.set(scale, scale, scale);
      });

      // Pulse Pro users
      markers.forEach(marker => {
        if (marker.userData.user?.plan === 'pro') {
          marker.userData.pulsePhase += 0.05;
          const scale = 1 + Math.sin(marker.userData.pulsePhase) * 0.3;
          marker.scale.set(scale, scale, scale);
        }
      });

      // Hover detection
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const disasterIntersects = raycasterRef.current.intersectObjects(disasterMarkersRef.current);
      if (disasterIntersects.length > 0 && disasterIntersects[0].object.userData.isDisaster) {
        setHoveredDisaster(disasterIntersects[0].object.userData.disaster);
        setHoveredMarker(null);
        canvasRef.current.style.cursor = 'pointer';
      } else {
        setHoveredDisaster(null);
        const userIntersects = raycasterRef.current.intersectObjects(markers);
        markers.forEach(marker => { if (marker !== hoveredMarker) marker.scale.set(1, 1, 1); });
        if (userIntersects.length > 0 && userIntersects[0].object.userData.isMarker) {
          const newHover = userIntersects[0].object;
          newHover.scale.set(1.5, 1.5, 1.5);
          setHoveredMarker(newHover);
          canvasRef.current.style.cursor = 'pointer';
        } else {
          setHoveredMarker(null);
          canvasRef.current.style.cursor = 'grab';
        }
      }

      stars.rotation.y += 0.0001;
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
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

    setTimeout(() => setIsGlobeLoading(false), 300);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      canvasRef.current?.removeEventListener('mousemove', handleMouseMove);
      canvasRef.current?.removeEventListener('click', handleClick);
    };
  }, [users.length]);

  // Update disaster markers dynamically
  useEffect(() => {
    if (!sceneRef.current || !activeLayers.disasters) return;
    const scene = sceneRef.current;
    
    // Remove old
    disasterMarkersRef.current.forEach(m => scene.remove(m));
    disasterMarkersRef.current = [];
    
    // Add new
    disasters.forEach(disaster => {
      const phi = (90 - disaster.lat) * (Math.PI / 180);
      const theta = (disaster.lon + 180) * (Math.PI / 180);
      const radius = 1.03;
      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const geometry = new THREE.SphereGeometry(0.015, 12, 12);
      let color;
      switch(disaster.type) {
        case 'earthquake': color = 0xff4444; break;
        case 'volcano': color = 0xff6600; break;
        case 'hurricane': color = 0x00aaff; break;
        case 'tsunami': color = 0x0066ff; break;
        default: color = 0xff4444;
      }
      const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
      const marker = new THREE.Mesh(geometry, material);
      marker.position.set(x, y, z);
      marker.userData = { disaster, pulsePhase: 0, isDisaster: true };
      scene.add(marker);
      disasterMarkersRef.current.push(marker);
    });
  }, [disasters, activeLayers.disasters]);

  // Update weather markers dynamically
  useEffect(() => {
    if (!sceneRef.current || !activeLayers.weather) return;
    const scene = sceneRef.current;
    
    weatherMarkersRef.current.forEach(m => scene.remove(m));
    weatherMarkersRef.current = [];
    
    weatherData.forEach(weather => {
      const phi = (90 - weather.lat) * (Math.PI / 180);
      const theta = (weather.lon + 180) * (Math.PI / 180);
      const radius = 1.04;
      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const geometry = new THREE.SphereGeometry(0.012, 10, 10);
      const material = new THREE.MeshBasicMaterial({
        color: weather.precipitation > 0 ? 0x4488ff : 0xffaa00,
        transparent: true,
        opacity: 0.7
      });
      const marker = new THREE.Mesh(geometry, material);
      marker.position.set(x, y, z);
      marker.userData = { weather, isWeather: true };
      scene.add(marker);
      weatherMarkersRef.current.push(marker);
    });
  }, [weatherData, activeLayers.weather]);

  // Temperature thermal layer with labels
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    
    tempMarkersRef.current.forEach(m => scene.remove(m));
    tempMarkersRef.current = [];
    
    if (showTempLayer && weatherData.length > 0) {
      weatherData.forEach(weather => {
        const phi = (90 - weather.lat) * (Math.PI / 180);
        const theta = (weather.lon + 180) * (Math.PI / 180);
        const radius = 1.015;
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        const temp = weather.temp || 20;
        let color;
        if (temp < 0) color = 0x0033ff;
        else if (temp < 10) color = 0x0088ff;
        else if (temp < 20) color = 0xffff00;
        else if (temp < 30) color = 0xff9900;
        else color = 0xff0000;

        const geometry = new THREE.CircleGeometry(0.15, 32);
        const material = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide
        });
        const heatSpot = new THREE.Mesh(geometry, material);
        heatSpot.position.set(x, y, z);
        heatSpot.lookAt(0, 0, 0);
        heatSpot.userData = { isTempHeat: true };
        scene.add(heatSpot);
        tempMarkersRef.current.push(heatSpot);

        // Add temperature label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        context.font = 'bold 60px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#ffffff';
        context.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        context.lineWidth = 4;
        const tempText = `${Math.round(temp)}°C`;
        context.strokeText(tempText, 128, 64);
        context.fillText(tempText, 128, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(x * 1.08, y * 1.08, z * 1.08);
        sprite.scale.set(0.2, 0.1, 1);
        scene.add(sprite);
        tempMarkersRef.current.push(sprite);
      });
    }
  }, [showTempLayer, weatherData]);

  // ISS layer
  useEffect(() => {
    if (!sceneRef.current || !issPosition) return;
    const scene = sceneRef.current;
    
    if (issMarkerRef.current) {
      scene.remove(issMarkerRef.current);
      issMarkerRef.current = null;
    }
    if (issOrbitRef.current) {
      scene.remove(issOrbitRef.current);
      issOrbitRef.current = null;
    }

    const phi = (90 - issPosition.lat) * (Math.PI / 180);
    const theta = (issPosition.lon + 180) * (Math.PI / 180);
    const radius = 1.1;
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    const issGeometry = new THREE.SphereGeometry(0.025, 16, 16);
    const issMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 1 });
    const issMarker = new THREE.Mesh(issGeometry, issMaterial);
    issMarker.position.set(x, y, z);
    issMarker.userData = { isISS: true };
    scene.add(issMarker);
    issMarkerRef.current = issMarker;

    const orbitPoints = [];
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const orbitPhi = (90 - issPosition.lat) * (Math.PI / 180);
      const orbitTheta = (issPosition.lon + 180 + angle * 57.3) * (Math.PI / 180);
      const ox = -radius * Math.sin(orbitPhi) * Math.cos(orbitTheta);
      const oy = radius * Math.cos(orbitPhi);
      const oz = radius * Math.sin(orbitPhi) * Math.sin(orbitTheta);
      orbitPoints.push(new THREE.Vector3(ox, oy, oz));
    }
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.4 });
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbit);
    issOrbitRef.current = orbit;
  }, [issPosition]);

  // AQI layer
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    
    aqiMarkersRef.current.forEach(m => scene.remove(m));
    aqiMarkersRef.current = [];
    
    if (aqiData.length > 0) {
      aqiData.forEach(aqi => {
        const phi = (90 - aqi.lat) * (Math.PI / 180);
        const theta = (aqi.lon + 180) * (Math.PI / 180);
        const radius = 1.045;
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        const geometry = new THREE.RingGeometry(0.02, 0.025, 16);
        const color = aqi.aqi < 50 ? 0x00ff00 : aqi.aqi < 100 ? 0xffff00 : aqi.aqi < 150 ? 0xff9900 : aqi.aqi < 200 ? 0xff0000 : 0x8b0000;
        const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(x, y, z);
        marker.lookAt(0, 0, 0);
        marker.userData = { aqi, isAQI: true };
        scene.add(marker);
        aqiMarkersRef.current.push(marker);
      });
    }
  }, [aqiData]);

  // Update layer visibility
  useEffect(() => {
    if (!sceneRef.current) return;
    userMarkersRef.current.forEach(m => m.visible = activeLayers.users);
    disasterMarkersRef.current.forEach(m => m.visible = activeLayers.disasters);
    weatherMarkersRef.current.forEach(m => m.visible = activeLayers.weather);
  }, [activeLayers]);

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

      {/* Interactive Globe */}
      <Card className="p-6">
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center gap-2">
            <GlobeIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Live User Globe</h3>
            <Badge variant="outline" className="text-xs">Live • {totalUsers} Users</Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="🔍 Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  const found = labelsRef.current.find(l => 
                    l.userData.text?.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  if (found && cameraRef.current && controlsRef.current) {
                    const targetPos = found.position.clone();
                    const direction = targetPos.clone().normalize().multiplyScalar(2.2);
                    const startPos = cameraRef.current.position.clone();
                    const startTime = Date.now();
                    const flyTo = () => {
                      const elapsed = Date.now() - startTime;
                      const progress = Math.min(elapsed / 1500, 1);
                      const eased = 1 - Math.pow(1 - progress, 3);
                      cameraRef.current.position.lerpVectors(startPos, direction, eased);
                      controlsRef.current.update();
                      if (progress < 1) requestAnimationFrame(flyTo);
                      else controlsRef.current.autoRotate = false;
                    };
                    flyTo();
                    setSearchQuery('');
                  }
                }
              }}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-48"
            />

            <Button size="sm" variant="outline" onClick={() => setShowLabels(!showLabels)}>
              <MapPin className="w-4 h-4 mr-1" />
              {showLabels ? 'Hide' : 'Show'} Labels
            </Button>

            <Button size="sm" variant="outline" onClick={() => {
              if (controlsRef.current) controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
            }}>
              {controlsRef.current?.autoRotate ? 'Pause' : 'Auto-Rotate'}
            </Button>
            
            <Button size="sm" variant="outline" onClick={() => {
              if (cameraRef.current && controlsRef.current) {
                cameraRef.current.position.set(0, 0, 3.2);
                controlsRef.current.target.set(0, 0, 0);
                controlsRef.current.update();
              }
            }}>
              Reset View
            </Button>
          </div>

          {/* Layers */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Layers:</span>
            <Button size="sm" variant={activeLayers.users ? "default" : "outline"} onClick={() => setActiveLayers(prev => ({ ...prev, users: !prev.users }))} className="h-7 text-xs">Users</Button>
            <Button size="sm" variant={activeLayers.disasters ? "default" : "outline"} onClick={() => setActiveLayers(prev => ({ ...prev, disasters: !prev.disasters }))} className="h-7 text-xs">Disasters</Button>
            <Button size="sm" variant={activeLayers.weather ? "default" : "outline"} onClick={() => setActiveLayers(prev => ({ ...prev, weather: !prev.weather }))} className="h-7 text-xs">Weather</Button>
            <Button size="sm" variant={showTempLayer ? "default" : "outline"} onClick={() => setShowTempLayer(!showTempLayer)} className="h-7 text-xs">🌡️ Temperature</Button>
            <Button size="sm" variant={issPosition ? "default" : "outline"} className="h-7 text-xs">🛰️ ISS</Button>
            <Button size="sm" variant={aqiData.length > 0 ? "default" : "outline"} className="h-7 text-xs">💨 AQI</Button>
          </div>
        </div>

        <div ref={containerRef} className="relative w-full h-[450px] sm:h-[550px] lg:h-[650px] bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
          {isGlobeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-slate-300 font-medium">Initializing Globe...</p>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className={`w-full h-full cursor-grab active:cursor-grabbing touch-none transition-opacity duration-1000 ${isGlobeLoading ? 'opacity-0' : 'opacity-100'}`} />

          {/* Hover tooltip */}
          {hoveredMarker && !hoveredDisaster && (
            <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl pointer-events-none z-10">
              <p className="text-sm font-semibold text-white">{hoveredMarker.userData.user.full_name || 'User'}</p>
              <p className="text-xs text-slate-400 mt-0.5">{hoveredMarker.userData.user.email}</p>
              {hoveredMarker.userData.user.plan === 'pro' && (
                <Badge className="mt-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px]">
                  <Crown className="w-2.5 h-2.5 mr-1" />PRO USER
                </Badge>
              )}
              <p className="text-[10px] text-slate-500 mt-2">Click for details</p>
            </div>
          )}

          {hoveredDisaster && (
            <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl pointer-events-none z-10 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${
                  hoveredDisaster.type === 'earthquake' ? 'bg-red-500' :
                  hoveredDisaster.type === 'volcano' ? 'bg-orange-500' :
                  hoveredDisaster.type === 'hurricane' ? 'bg-blue-400' :
                  hoveredDisaster.type === 'tsunami' ? 'bg-blue-600' : 'bg-red-400'
                } animate-pulse`}></div>
                <p className="text-sm font-bold text-white capitalize">{hoveredDisaster.type}</p>
              </div>
              <p className="text-xs text-slate-300">{hoveredDisaster.place || 'Unknown Location'}</p>
              {hoveredDisaster.magnitude && <p className="text-xs text-amber-400 mt-1">Magnitude: {hoveredDisaster.magnitude}</p>}
              <p className="text-[10px] text-slate-500 mt-2">Click for details</p>
            </div>
          )}

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 space-y-1.5 shadow-xl max-h-[80%] overflow-y-auto">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg"></div>
              <span className="text-xs text-slate-300 font-medium">Free Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-lg"></div>
              <span className="text-xs text-slate-300 font-medium">Pro Users</span>
            </div>
            {activeLayers.disasters && (
              <>
                <div className="border-t border-slate-700 pt-1.5"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-lg"></div>
                  <span className="text-xs text-slate-300 font-medium">Earthquake</span>
                </div>
              </>
            )}
            {showTempLayer && (
              <>
                <div className="border-t border-slate-700 pt-1.5"></div>
                <div className="text-xs text-slate-300 font-medium mb-1">Temperature</div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                </div>
                <span className="text-[9px] text-slate-400">Freezing → Hot</span>
              </>
            )}
            {issPosition && (
              <>
                <div className="border-t border-slate-700 pt-1.5"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-lg"></div>
                  <span className="text-xs text-slate-300 font-medium">ISS Live</span>
                </div>
              </>
            )}
            {aqiData.length > 0 && (
              <>
                <div className="border-t border-slate-700 pt-1.5"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  <span className="text-xs text-slate-300">AQI Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <span className="text-xs text-slate-300">AQI Poor</span>
                </div>
              </>
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg px-4 py-2 hidden sm:block">
            <p className="text-xs text-slate-300 text-center">🖱️ Drag • 🔍 Zoom • 👆 Click • 🌍 Explore</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3 space-y-1">
          <span className="block">🌍 200+ countries • 250+ states/provinces • ⭐ Capital cities with gold stars</span>
          <span className="block">📍 Live ISS • Earthquakes • Weather stations • Air quality • Thermal temperature view with readings</span>
          <span className="block">🔍 Location search • Real UTC day/night cycle • Professional data visualization</span>
        </p>
      </Card>

      {/* Selected panels */}
      {selectedLocation && (
        <Card className="p-6 border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {selectedLocation.type === 'disaster' && (
                <>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize mb-2">{selectedLocation.data.type}</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedLocation.data.place}</p>
                  {selectedLocation.data.magnitude && <p className="text-sm text-amber-600 mt-1">Magnitude: {selectedLocation.data.magnitude}</p>}
                </>
              )}
              {selectedLocation.type === 'weather' && (
                <>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{selectedLocation.data.name}</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">🌡️ {selectedLocation.data.temp}°C</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">💨 Wind: {selectedLocation.data.windSpeed} km/h</p>
                </>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedLocation(null)} className="h-8 w-8"><X className="w-4 h-4" /></Button>
          </div>
        </Card>
      )}

      {selectedUser && (
        <Card className="p-6 border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {selectedUser.full_name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.full_name || 'User'}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedUser.email}</p>
                {selectedUser.plan === 'pro' && (
                  <Badge className="mt-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white"><Crown className="w-3 h-3 mr-1" />PRO</Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <FileUp className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-slate-500">Files</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {allStats.filter(s => s.created_by === selectedUser.email).length}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <HardDrive className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-slate-500">Saved</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formatBytes(allStats.filter(s => s.created_by === selectedUser.email).reduce((sum, stat) => sum + Math.max(0, stat.original_size - stat.compressed_size), 0))}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Live Activity</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-slate-500">Live</span>
            </div>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Waiting for activity...</p>
            ) : (
              recentActivity.map(stat => (
                <div key={stat.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    stat.media_type === 'image' ? 'bg-blue-100 dark:bg-blue-900' :
                    stat.media_type === 'video' ? 'bg-purple-100 dark:bg-purple-900' : 'bg-amber-100 dark:bg-amber-900'
                  }`}>
                    {stat.media_type === 'image' ? '🖼️' : stat.media_type === 'video' ? '🎬' : '🎵'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{stat.media_type} → {stat.output_format.toUpperCase()}</p>
                    <p className="text-xs text-slate-500 truncate">{stat.created_by}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-emerald-600">-{formatBytes(Math.max(0, stat.original_size - stat.compressed_size))}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Users (7 Days)</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {(() => {
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              const userStats = {};
              allStats.filter(s => new Date(s.created_date) > weekAgo).forEach(stat => {
                if (!userStats[stat.created_by]) userStats[stat.created_by] = { count: 0, saved: 0 };
                userStats[stat.created_by].count++;
                userStats[stat.created_by].saved += Math.max(0, stat.original_size - stat.compressed_size);
              });
              return Object.entries(userStats).sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([email, stats], idx) => {
                const user = users.find(u => u.email === email);
                return (
                  <div key={email} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer" onClick={() => user && setSelectedUser(user)}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">#{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{user?.full_name || email}</p>
                      <p className="text-xs text-slate-500">{stats.count} files • {formatBytes(stats.saved)}</p>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </Card>
      </div>
    </div>
  );
}