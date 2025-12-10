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
  const [hoveredDisaster, setHoveredDisaster] = useState(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const markersRef = useRef([]);
  const [globeStyle, setGlobeStyle] = useState('earth');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const labelsRef = useRef([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const disasterMarkersRef = useRef([]);
  const [weatherData, setWeatherData] = useState([]);
  const weatherMarkersRef = useRef([]);
  const [activeLayers, setActiveLayers] = useState({
    users: true,
    disasters: true,
    weather: true,
    temperature: false,
    precipitation: false,
    windSpeed: false
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isGlobeLoading, setIsGlobeLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [issPosition, setIssPosition] = useState(null);
  const issMarkerRef = useRef(null);
  const issOrbitRef = useRef(null);
  const windParticlesRef = useRef([]);
  const [showWindLayer, setShowWindLayer] = useState(false);
  const [showTempLayer, setShowTempLayer] = useState(false);
  const [showPressureLayer, setShowPressureLayer] = useState(false);
  const [showStormTracks, setShowStormTracks] = useState(false);
  const [aqiData, setAqiData] = useState([]);
  const aqiMarkersRef = useRef([]);
  const [stormData, setStormData] = useState([]);
  const stormMarkersRef = useRef([]);
  const pressureMarkersRef = useRef([]);
  const sunRef = useRef(null);
  const terminatorRef = useRef(null);
  const [userActivityHeatmap, setUserActivityHeatmap] = useState([]);
  const heatmapRef = useRef([]);

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

  // Fetch real-time natural disasters and weather
  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const disasters = [];
        
        // Fetch significant earthquakes
        try {
          const earthquakeRes = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson');
          const earthquakeData = await earthquakeRes.json();
          earthquakeData.features?.slice(0, 50).forEach(eq => {
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

        // Fetch active volcanoes
        try {
          const volcanoRes = await fetch('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2025-01-01&minmagnitude=1&eventtype=volcanic');
          const volcanoData = await volcanoRes.json();
          volcanoData.features?.slice(0, 20).forEach(vol => {
            disasters.push({
              type: 'volcano',
              lat: vol.geometry.coordinates[1],
              lon: vol.geometry.coordinates[0],
              place: vol.properties.place,
              time: vol.properties.time
            });
          });
        } catch (e) { console.error('Volcano fetch failed:', e); }

        // Fetch hurricanes from NOAA
        try {
          const hurricaneRes = await fetch('https://www.nhc.noaa.gov/CurrentStorms.json');
          const hurricaneData = await hurricaneRes.json();
          hurricaneData?.activeStorms?.forEach(storm => {
            if (storm.latitudeNumeric && storm.longitudeNumeric) {
              disasters.push({
                type: 'hurricane',
                lat: storm.latitudeNumeric,
                lon: storm.longitudeNumeric,
                name: storm.name,
                category: storm.classification,
                place: storm.name
              });
            }
          });
        } catch (e) { console.error('Hurricane fetch failed:', e); }

        // Fetch tsunami data
        try {
          const tsunamiRes = await fetch('https://www.tsunami.gov/events/json/');
          const tsunamiData = await tsunamiRes.json();
          tsunamiData?.features?.slice(0, 10).forEach(tsunami => {
            disasters.push({
              type: 'tsunami',
              lat: tsunami.geometry.coordinates[1],
              lon: tsunami.geometry.coordinates[0],
              place: tsunami.properties.place,
              magnitude: tsunami.properties.magnitude
            });
          });
        } catch (e) { console.error('Tsunami fetch failed:', e); }

        // Add simulated tornadoes and blizzards (real-time tornado/blizzard APIs are limited)
        // In production, you'd integrate with weather.gov or similar
        const severeWeatherLocations = [
          { type: 'tornado', lat: 35.5, lon: -97.5, place: 'Oklahoma City Area' },
          { type: 'tornado', lat: 32.5, lon: -96.8, place: 'Dallas Area' },
          { type: 'blizzard', lat: 44.9, lon: -93.2, place: 'Minneapolis Area' },
          { type: 'blizzard', lat: 43.1, lon: -77.6, place: 'Rochester Area' }
        ];
        
        disasters.push(...severeWeatherLocations);

        setDisasters(disasters);
      } catch (error) {
        console.error('Error fetching disaster data:', error);
      }
    };

    const fetchWeather = async () => {
      try {
        const weather = [];
        
        // Comprehensive weather stations across all continents
        const cities = [
          // North America
          { name: 'New York', lat: 40.7, lon: -74 },
          { name: 'Los Angeles', lat: 34.05, lon: -118.25 },
          { name: 'Chicago', lat: 41.88, lon: -87.63 },
          { name: 'Toronto', lat: 43.65, lon: -79.38 },
          { name: 'Mexico City', lat: 19.43, lon: -99.13 },
          { name: 'Miami', lat: 25.76, lon: -80.19 },
          { name: 'Vancouver', lat: 49.28, lon: -123.12 },
          // Europe
          { name: 'London', lat: 51.5, lon: -0.1 },
          { name: 'Paris', lat: 48.86, lon: 2.35 },
          { name: 'Berlin', lat: 52.52, lon: 13.4 },
          { name: 'Rome', lat: 41.9, lon: 12.5 },
          { name: 'Madrid', lat: 40.42, lon: -3.7 },
          { name: 'Moscow', lat: 55.75, lon: 37.62 },
          { name: 'Stockholm', lat: 59.33, lon: 18.07 },
          // Asia
          { name: 'Tokyo', lat: 35.6, lon: 139.6 },
          { name: 'Beijing', lat: 39.9, lon: 116.4 },
          { name: 'Shanghai', lat: 31.23, lon: 121.47 },
          { name: 'Seoul', lat: 37.57, lon: 126.98 },
          { name: 'Mumbai', lat: 19.08, lon: 72.88 },
          { name: 'Bangkok', lat: 13.76, lon: 100.5 },
          { name: 'Singapore', lat: 1.3, lon: 103.8 },
          { name: 'Dubai', lat: 25.2, lon: 55.2 },
          { name: 'Hong Kong', lat: 22.32, lon: 114.17 },
          { name: 'Jakarta', lat: -6.21, lon: 106.85 },
          // South America
          { name: 'São Paulo', lat: -23.55, lon: -46.63 },
          { name: 'Buenos Aires', lat: -34.6, lon: -58.38 },
          { name: 'Lima', lat: -12.05, lon: -77.04 },
          { name: 'Bogotá', lat: 4.71, lon: -74.07 },
          { name: 'Santiago', lat: -33.45, lon: -70.67 },
          // Africa
          { name: 'Cairo', lat: 30.04, lon: 31.24 },
          { name: 'Lagos', lat: 6.52, lon: 3.38 },
          { name: 'Johannesburg', lat: -26.2, lon: 28.05 },
          { name: 'Nairobi', lat: -1.29, lon: 36.82 },
          { name: 'Casablanca', lat: 33.57, lon: -7.59 },
          // Oceania
          { name: 'Sydney', lat: -33.8, lon: 151.2 },
          { name: 'Melbourne', lat: -37.81, lon: 144.96 },
          { name: 'Auckland', lat: -36.85, lon: 174.76 },
          { name: 'Perth', lat: -31.95, lon: 115.86 }
        ];

        for (const city of cities) {
          try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,precipitation,cloud_cover,wind_speed_10m&timezone=auto`);
            const data = await res.json();
            weather.push({
              ...city,
              temp: data.current?.temperature_2m,
              precipitation: data.current?.precipitation,
              clouds: data.current?.cloud_cover,
              windSpeed: data.current?.wind_speed_10m
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
          { name: 'São Paulo', lat: -23.55, lon: -46.63 }
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

  // Fetch storm data
  useEffect(() => {
    const fetchStorms = async () => {
      try {
        const res = await fetch('https://www.nhc.noaa.gov/CurrentStorms.json');
        const data = await res.json();
        if (data.activeStorms) {
          setStormData(data.activeStorms.map(storm => ({
            name: storm.name,
            lat: storm.latitudeNumeric || 0,
            lon: storm.longitudeNumeric || 0,
            category: storm.intensity,
            windSpeed: storm.maxWindKts || 0,
            pressure: storm.pressure || 0
          })));
        }
      } catch (e) { console.error('Storm fetch failed:', e); }
    };

    if (showStormTracks) {
      fetchStorms();
      const interval = setInterval(fetchStorms, 300000);
      return () => clearInterval(interval);
    }
  }, [showStormTracks]);

  // Generate user activity heatmap from real user data
  useEffect(() => {
    if (users && users.length > 0) {
      const activityMap = {};
      users.forEach(user => {
        if (user.location?.lat && user.location?.lon) {
          const key = `${Math.round(user.location.lat)},${Math.round(user.location.lon)}`;
          activityMap[key] = (activityMap[key] || 0) + 1;
        }
      });
      
      const heatmapData = Object.entries(activityMap).map(([coords, count]) => {
        const [lat, lon] = coords.split(',').map(Number);
        return { lat, lon, intensity: count };
      });
      
      setUserActivityHeatmap(heatmapData);
    }
  }, [users]);

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

  // Initialize 3D Globe with interactivity - ONLY ONCE
  useEffect(() => {
    if (!canvasRef.current || users.length === 0 || globe) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Add starfield background for space realism
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
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.8
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    // Add sun or moon based on user's local time
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    
    if (isDay) {
      // Add sun
      const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
      const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xfdb813,
        emissive: 0xfdb813,
        emissiveIntensity: 1
      });
      const sun = new THREE.Mesh(sunGeometry, sunMaterial);
      sun.position.set(40, 20, -30);
      scene.add(sun);
      
      // Sun glow
      const sunGlowGeometry = new THREE.SphereGeometry(3.5, 32, 32);
      const sunGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xfdb813,
        transparent: true,
        opacity: 0.3
      });
      const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
      sunGlow.position.set(40, 20, -30);
      scene.add(sunGlow);
    } else {
      // Add moon
      const moonGeometry = new THREE.SphereGeometry(2, 32, 32);
      const moonMaterial = new THREE.MeshBasicMaterial({
        color: 0xe8e8e8,
        emissive: 0xaaaaaa,
        emissiveIntensity: 0.6
      });
      const moon = new THREE.Mesh(moonGeometry, moonMaterial);
      moon.position.set(40, 20, -30);
      scene.add(moon);
      
      // Moon glow
      const moonGlowGeometry = new THREE.SphereGeometry(2.3, 32, 32);
      const moonGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xc8c8e8,
        transparent: true,
        opacity: 0.2
      });
      const moonGlow = new THREE.Mesh(moonGlowGeometry, moonGlowMaterial);
      moonGlow.position.set(40, 20, -30);
      scene.add(moonGlow);
    }
    
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
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.set(0, 0, 3.2);

    // Add OrbitControls for interactivity
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
    controls.enablePan = false; // Disable panning for better UX
    controlsRef.current = controls;

    // Add disaster markers
    const disasterMarkers = [];
    if (activeLayers.disasters) {
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
          case 'tornado': color = 0x9900ff; break;
          case 'blizzard': color = 0xccccff; break;
          default: color = 0xff4444;
        }
        const material = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.9
        });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(x, y, z);
        marker.userData = { disaster, pulsePhase: 0, isDisaster: true };
        scene.add(marker);
        disasterMarkers.push(marker);
      });
    }
    disasterMarkersRef.current = disasterMarkers;

    // Add weather markers
    const weatherMarkers = [];
    if (activeLayers.weather && weatherData.length > 0) {
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
        weatherMarkers.push(marker);
      });
    }
    weatherMarkersRef.current = weatherMarkers;

    // Add AQI markers
    const aqiMarkers = [];
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
        const material = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide
        });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(x, y, z);
        marker.lookAt(0, 0, 0);
        marker.userData = { aqi, isAQI: true };
        scene.add(marker);
        aqiMarkers.push(marker);
      });
    }
    aqiMarkersRef.current = aqiMarkers;

    // Add ISS marker and orbit
    if (issPosition) {
      const phi = (90 - issPosition.lat) * (Math.PI / 180);
      const theta = (issPosition.lon + 180) * (Math.PI / 180);
      const radius = 1.1;
      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const issGeometry = new THREE.SphereGeometry(0.025, 16, 16);
      const issMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 1
      });
      const issMarker = new THREE.Mesh(issGeometry, issMaterial);
      issMarker.position.set(x, y, z);
      issMarker.userData = { isISS: true };
      scene.add(issMarker);
      issMarkerRef.current = issMarker;

      // ISS orbit trail
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
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.4
      });
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbit);
      issOrbitRef.current = orbit;
    }

    // Wind particles system
    if (showWindLayer && weatherData.length > 0) {
      const windParticles = [];
      weatherData.forEach(weather => {
        if (weather.windSpeed > 5) {
          const particleCount = Math.min(Math.floor(weather.windSpeed / 5), 10);
          for (let i = 0; i < particleCount; i++) {
            const phi = (90 - weather.lat + (Math.random() - 0.5) * 2) * (Math.PI / 180);
            const theta = (weather.lon + 180 + (Math.random() - 0.5) * 2) * (Math.PI / 180);
            const radius = 1.06;
            const x = -radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.cos(phi);
            const z = radius * Math.sin(phi) * Math.sin(theta);

            const geometry = new THREE.SphereGeometry(0.003, 4, 4);
            const material = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.6 });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.set(x, y, z);
            particle.userData = { 
              isWindParticle: true, 
              speed: weather.windSpeed / 100,
              angle: Math.random() * Math.PI * 2
            };
            scene.add(particle);
            windParticles.push(particle);
          }
        }
      });
      windParticlesRef.current = windParticles;
    }

    // Temperature heatmap overlay
    if (showTempLayer && weatherData.length > 0) {
      weatherData.forEach(weather => {
        const phi = (90 - weather.lat) * (Math.PI / 180);
        const theta = (weather.lon + 180) * (Math.PI / 180);
        const radius = 1.015;
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        const temp = weather.temp;
        let color;
        if (temp < 0) color = 0x0000ff; // Blue - freezing
        else if (temp < 10) color = 0x00aaff; // Light blue - cold
        else if (temp < 20) color = 0xffff00; // Yellow - mild
        else if (temp < 30) color = 0xff9900; // Orange - warm
        else color = 0xff0000; // Red - hot

        const geometry = new THREE.CircleGeometry(0.15, 32);
        const material = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide
        });
        const heatSpot = new THREE.Mesh(geometry, material);
        heatSpot.position.set(x, y, z);
        heatSpot.lookAt(0, 0, 0);
        heatSpot.userData = { isTempHeat: true };
        scene.add(heatSpot);
      });
    }

    // Create high-detail globe with different styles
    const geometry = new THREE.SphereGeometry(1, 256, 256);
    let material;

    if (globeStyle === 'earth') {
      // Load realistic Earth texture with high quality
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
      // Matrix green style with enhanced detail
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
    sphere.scale.set(0.8, 0.8, 0.8); // Start smaller for animation
    scene.add(sphere);
    
    // Add animated cloud layer for realism
    const cloudGeometry = new THREE.SphereGeometry(1.01, 128, 128);
    const cloudTexture = new THREE.TextureLoader().load('https://unpkg.com/three-globe@2.31.1/example/img/earth-water.png');
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: globeStyle === 'earth' ? 0.15 : 0,
      depthWrite: false
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    clouds.userData = { isClouds: true };
    scene.add(clouds);

    // Add wireframe overlay and country borders (only for Matrix style)
    let wireframe = null;
    let countryBorders = null;
    if (globeStyle === 'matrix') {
      const wireframeGeometry = new THREE.SphereGeometry(1.005, 64, 64);
      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x059669,
        wireframe: true,
        transparent: true,
        opacity: 0.25
      });
      wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
      wireframe.userData = { isWireframe: true };
      scene.add(wireframe);
      
      // Load and add country borders
      fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
        .then(res => res.json())
        .then(data => {
          const borderGroup = new THREE.Group();
          data.features.forEach(feature => {
            if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
              const coords = feature.geometry.type === 'Polygon' 
                ? [feature.geometry.coordinates] 
                : feature.geometry.coordinates;
              
              coords.forEach(polygon => {
                polygon.forEach(ring => {
                  const points = [];
                  ring.forEach(([lon, lat]) => {
                    const phi = (90 - lat) * (Math.PI / 180);
                    const theta = (lon + 180) * (Math.PI / 180);
                    const radius = 1.006;
                    const x = -radius * Math.sin(phi) * Math.cos(theta);
                    const y = radius * Math.cos(phi);
                    const z = radius * Math.sin(phi) * Math.sin(theta);
                    points.push(new THREE.Vector3(x, y, z));
                  });
                  
                  if (points.length > 1) {
                    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                    const lineMaterial = new THREE.LineBasicMaterial({
                      color: 0xffffff,
                      transparent: true,
                      opacity: 0.6,
                      linewidth: 2
                    });
                    const line = new THREE.Line(lineGeometry, lineMaterial);
                    borderGroup.add(line);
                  }
                });
              });
            }
          });
          scene.add(borderGroup);
          countryBorders = borderGroup;
        })
        .catch(err => console.error('Failed to load country borders:', err));
    }

    // Calculate real UTC sun position
    const calculateSunPosition = (date = new Date()) => {
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
      const declination = 23.45 * Math.sin((360/365) * (dayOfYear - 81) * Math.PI / 180);
      
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      const seconds = date.getUTCSeconds();
      const timeDecimal = hours + minutes/60 + seconds/3600;
      const longitude = (timeDecimal - 12) * 15;
      
      return { lat: declination, lon: longitude };
    };

    const sunPos = calculateSunPosition(new Date());
    const latitude = sunPos.lat;
    const longitude = sunPos.lon;

    const sunPhi = (90 - latitude) * (Math.PI / 180);
    const sunTheta = (longitude + 180) * (Math.PI / 180);
    const sunDirection = new THREE.Vector3(
      -Math.sin(sunPhi) * Math.cos(sunTheta),
      Math.cos(sunPhi),
      Math.sin(sunPhi) * Math.sin(sunTheta)
    );

    // Add day/night terminator visualization
    const terminatorGeometry = new THREE.SphereGeometry(1.002, 128, 128);
    const terminatorMaterial = new THREE.ShaderMaterial({
      uniforms: {
        sunDirection: { value: sunDirection.clone() }
      },
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
    terminator.userData = { isTerminator: true };
    scene.add(terminator);
    terminatorRef.current = terminator;

    // Add realistic atmosphere glow with multiple layers
    const atmosphereGeometry1 = new THREE.SphereGeometry(1.08, 64, 64);
    const atmosphereColor = globeStyle === 'earth' ? 0x4a9eff : 0x34d399;
    const atmosphereMaterial1 = new THREE.MeshBasicMaterial({
      color: atmosphereColor,
      transparent: true,
      opacity: globeStyle === 'earth' ? 0.15 : 0.12,
      side: THREE.BackSide
    });
    const atmosphere1 = new THREE.Mesh(atmosphereGeometry1, atmosphereMaterial1);
    atmosphere1.userData = { isAtmosphere: true };
    scene.add(atmosphere1);
    
    // Outer atmosphere glow
    const atmosphereGeometry2 = new THREE.SphereGeometry(1.15, 64, 64);
    const atmosphereMaterial2 = new THREE.MeshBasicMaterial({
      color: atmosphereColor,
      transparent: true,
      opacity: globeStyle === 'earth' ? 0.08 : 0.06,
      side: THREE.BackSide
    });
    const atmosphere2 = new THREE.Mesh(atmosphereGeometry2, atmosphereMaterial2);
    atmosphere2.userData = { isAtmosphere: true };
    scene.add(atmosphere2);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, globeStyle === 'earth' ? 0.4 : 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, globeStyle === 'earth' ? 1.2 : 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.position.set(-5, -3, -5);
    scene.add(pointLight);

    // Google Earth-style label creation - labels ON the surface
    const createLabel = (text, lat, lon, zoomLevel, priority = 1, isCapital = false) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const radius = 1.01; // Just slightly above surface for visibility
      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 1024;
      canvas.height = 256;
      
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Determine font size based on zoom level and priority
      let fontSize, fontWeight, isItalic;
      if (zoomLevel === 1) { // Oceans
        fontSize = 48;
        fontWeight = 'italic';
        isItalic = true;
      } else if (zoomLevel === 2) { // Countries
        fontSize = 56;
        fontWeight = 'bold';
      } else if (zoomLevel === 3) { // States
        fontSize = 44;
        fontWeight = '600';
      } else { // Cities
        fontSize = 36;
        fontWeight = 'normal';
      }

      context.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      // Draw star for capital cities
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

      // Add text outline for better readability (Google Earth style)
      context.lineWidth = 6;
      context.strokeStyle = globeStyle === 'earth' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 20, 10, 0.9)';
      context.strokeText(text, canvas.width / 2, canvas.height / 2);

      // Fill text
      context.fillStyle = globeStyle === 'earth' 
        ? (isItalic ? '#88ccff' : '#ffffff')
        : (isItalic ? '#34d399' : '#10b981');
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true,
        opacity: 0,
        depthTest: false // Labels always on top
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x, y, z);
      
      // Scale based on zoom level
      const scaleMap = {
        1: { w: 1.0, h: 0.25 },  // Oceans - large
        2: { w: 0.7, h: 0.175 }, // Countries - medium
        3: { w: 0.5, h: 0.125 }  // States - smaller
      };
      const scale = scaleMap[zoomLevel] || { w: 0.4, h: 0.1 };
      sprite.scale.set(scale.w, scale.h, 1);
      
      sprite.userData = { 
        isLabel: true, 
        zoomLevel, 
        priority,
        text,
        lat,
        lon
      };
      sphere.add(sprite);
      return sprite;
    };

    // Add comprehensive location labels (Google Earth style)
    const labels = [];
    if (showLabels) {
      const locations = [
        // Oceans (zoom level 1 - farthest)
        { name: 'Pacific Ocean', lat: 0, lon: -160, ocean: true, zoom: 1 },
        { name: 'Atlantic Ocean', lat: 15, lon: -30, ocean: true, zoom: 1 },
        { name: 'Indian Ocean', lat: -20, lon: 80, ocean: true, zoom: 1 },
        { name: 'Arctic Ocean', lat: 75, lon: 0, ocean: true, zoom: 1 },
        { name: 'Southern Ocean', lat: -60, lon: 0, ocean: true, zoom: 1 },
        
        // ALL Countries - Comprehensive Global Coverage (zoom level 2)
        { name: 'United States', lat: 39, lon: -95, zoom: 2 },
        { name: 'Canada', lat: 56, lon: -106, zoom: 2 },
        { name: 'Mexico', lat: 23, lon: -102, zoom: 2 },
        { name: 'Guatemala', lat: 15.5, lon: -90.25, zoom: 2 },
        { name: 'Cuba', lat: 21.5, lon: -80, zoom: 2 },
        { name: 'Brazil', lat: -10, lon: -55, zoom: 2 },
        { name: 'Argentina', lat: -34, lon: -64, zoom: 2 },
        { name: 'Chile', lat: -30, lon: -71, zoom: 2 },
        { name: 'Colombia', lat: 4, lon: -72, zoom: 2 },
        { name: 'Peru', lat: -10, lon: -76, zoom: 2 },
        { name: 'Venezuela', lat: 8, lon: -66, zoom: 2 },
        { name: 'United Kingdom', lat: 54, lon: -2, zoom: 2 },
        { name: 'France', lat: 47, lon: 2, zoom: 2 },
        { name: 'Germany', lat: 51, lon: 10, zoom: 2 },
        { name: 'Spain', lat: 40, lon: -4, zoom: 2 },
        { name: 'Italy', lat: 42, lon: 12, zoom: 2 },
        { name: 'Poland', lat: 52, lon: 20, zoom: 2 },
        { name: 'Ukraine', lat: 49, lon: 32, zoom: 2 },
        { name: 'Romania', lat: 46, lon: 25, zoom: 2 },
        { name: 'Netherlands', lat: 52.5, lon: 5.75, zoom: 2 },
        { name: 'Belgium', lat: 50.5, lon: 4.5, zoom: 2 },
        { name: 'Greece', lat: 39, lon: 22, zoom: 2 },
        { name: 'Portugal', lat: 39.5, lon: -8, zoom: 2 },
        { name: 'Sweden', lat: 62, lon: 15, zoom: 2 },
        { name: 'Norway', lat: 60.5, lon: 8.5, zoom: 2 },
        { name: 'Finland', lat: 64, lon: 26, zoom: 2 },
        { name: 'Denmark', lat: 56, lon: 10, zoom: 2 },
        { name: 'Russia', lat: 60, lon: 100, zoom: 2 },
        { name: 'China', lat: 35, lon: 105, zoom: 2 },
        { name: 'India', lat: 20, lon: 77, zoom: 2 },
        { name: 'Japan', lat: 36, lon: 138, zoom: 2 },
        { name: 'South Korea', lat: 37, lon: 127.5, zoom: 2 },
        { name: 'North Korea', lat: 40, lon: 127, zoom: 2 },
        { name: 'Thailand', lat: 15, lon: 100, zoom: 2 },
        { name: 'Vietnam', lat: 16, lon: 106, zoom: 2 },
        { name: 'Indonesia', lat: -2, lon: 118, zoom: 2 },
        { name: 'Philippines', lat: 13, lon: 122, zoom: 2 },
        { name: 'Malaysia', lat: 2.5, lon: 112.5, zoom: 2 },
        { name: 'Pakistan', lat: 30, lon: 70, zoom: 2 },
        { name: 'Bangladesh', lat: 24, lon: 90, zoom: 2 },
        { name: 'Turkey', lat: 39, lon: 35, zoom: 2 },
        { name: 'Saudi Arabia', lat: 24, lon: 45, zoom: 2 },
        { name: 'Iran', lat: 32, lon: 53, zoom: 2 },
        { name: 'Iraq', lat: 33, lon: 44, zoom: 2 },
        { name: 'Israel', lat: 31.5, lon: 34.75, zoom: 2 },
        { name: 'Australia', lat: -25, lon: 133, zoom: 2 },
        { name: 'New Zealand', lat: -41, lon: 174, zoom: 2 },
        { name: 'South Africa', lat: -29, lon: 24, zoom: 2 },
        { name: 'Egypt', lat: 26, lon: 30, zoom: 2 },
        { name: 'Nigeria', lat: 9, lon: 8, zoom: 2 },
        { name: 'Kenya', lat: 1, lon: 38, zoom: 2 },
        { name: 'Ethiopia', lat: 8, lon: 38, zoom: 2 },
        { name: 'Morocco', lat: 32, lon: -5, zoom: 2 },
        { name: 'Algeria', lat: 28, lon: 3, zoom: 2 },
        { name: 'Libya', lat: 27, lon: 17, zoom: 2 },
        { name: 'Tunisia', lat: 34, lon: 9, zoom: 2 },
        { name: 'Sudan', lat: 15, lon: 30, zoom: 2 },
        { name: 'Mali', lat: 17, lon: -4, zoom: 2 },
        { name: 'Niger', lat: 16, lon: 8, zoom: 2 },
        { name: 'Chad', lat: 15, lon: 19, zoom: 2 },
        { name: 'Somalia', lat: 5.15, lon: 46.2, zoom: 2 },
        { name: 'Mozambique', lat: -18.66, lon: 35.53, zoom: 2 },
        { name: 'Madagascar', lat: -18.77, lon: 46.87, zoom: 2 },
        { name: 'Botswana', lat: -22.33, lon: 24.68, zoom: 2 },
        { name: 'Namibia', lat: -22.96, lon: 18.49, zoom: 2 },
        { name: 'Zimbabwe', lat: -19, lon: 29.15, zoom: 2 },
        { name: 'Zambia', lat: -13.13, lon: 27.85, zoom: 2 },
        { name: 'Angola', lat: -11.2, lon: 17.87, zoom: 2 },
        { name: 'Tanzania', lat: -6.37, lon: 34.89, zoom: 2 },
        { name: 'Uganda', lat: 1.37, lon: 32.29, zoom: 2 },
        { name: 'Rwanda', lat: -1.94, lon: 29.87, zoom: 2 },
        { name: 'Burundi', lat: -3.37, lon: 29.92, zoom: 2 },
        { name: 'Congo', lat: -4.04, lon: 21.76, zoom: 2 },
        { name: 'Gabon', lat: -0.8, lon: 11.61, zoom: 2 },
        { name: 'Cameroon', lat: 7.37, lon: 12.35, zoom: 2 },
        { name: 'Ghana', lat: 7.95, lon: -1.02, zoom: 2 },
        { name: 'Ivory Coast', lat: 7.54, lon: -5.55, zoom: 2 },
        { name: 'Senegal', lat: 14.5, lon: -14.45, zoom: 2 },
        { name: 'Mauritania', lat: 21.01, lon: -10.94, zoom: 2 },
        { name: 'Benin', lat: 9.31, lon: 2.32, zoom: 2 },
        { name: 'Togo', lat: 8.62, lon: 0.82, zoom: 2 },
        { name: 'Sierra Leone', lat: 8.46, lon: -11.78, zoom: 2 },
        { name: 'Liberia', lat: 6.43, lon: -9.43, zoom: 2 },
        { name: 'Guinea', lat: 9.95, lon: -9.7, zoom: 2 },
        { name: 'Burkina Faso', lat: 12.24, lon: -1.56, zoom: 2 },
        { name: 'Central African Republic', lat: 6.61, lon: 20.94, zoom: 2 },
        { name: 'Eritrea', lat: 15.18, lon: 39.78, zoom: 2 },
        { name: 'Djibouti', lat: 11.83, lon: 42.59, zoom: 2 },
        { name: 'Malawi', lat: -13.25, lon: 34.3, zoom: 2 },
        { name: 'Lesotho', lat: -29.61, lon: 28.23, zoom: 2 },
        { name: 'Eswatini', lat: -26.52, lon: 31.47, zoom: 2 },
        
        // Asia - Complete Coverage
        { name: 'Afghanistan', lat: 33.94, lon: 67.71, zoom: 2 },
        { name: 'Kazakhstan', lat: 48.02, lon: 66.92, zoom: 2 },
        { name: 'Uzbekistan', lat: 41.38, lon: 64.59, zoom: 2 },
        { name: 'Turkmenistan', lat: 38.97, lon: 59.56, zoom: 2 },
        { name: 'Tajikistan', lat: 38.86, lon: 71.28, zoom: 2 },
        { name: 'Kyrgyzstan', lat: 41.2, lon: 74.77, zoom: 2 },
        { name: 'Mongolia', lat: 46.86, lon: 103.85, zoom: 2 },
        { name: 'Myanmar', lat: 21.91, lon: 95.96, zoom: 2 },
        { name: 'Laos', lat: 19.86, lon: 102.5, zoom: 2 },
        { name: 'Cambodia', lat: 12.57, lon: 104.99, zoom: 2 },
        { name: 'Nepal', lat: 28.39, lon: 84.12, zoom: 2 },
        { name: 'Bhutan', lat: 27.51, lon: 90.43, zoom: 2 },
        { name: 'Sri Lanka', lat: 7.87, lon: 80.77, zoom: 2 },
        { name: 'Maldives', lat: 3.2, lon: 73.22, zoom: 2 },
        { name: 'Yemen', lat: 15.55, lon: 48.52, zoom: 2 },
        { name: 'Oman', lat: 21.51, lon: 55.92, zoom: 2 },
        { name: 'United Arab Emirates', lat: 23.42, lon: 53.85, zoom: 2 },
        { name: 'Qatar', lat: 25.35, lon: 51.18, zoom: 2 },
        { name: 'Kuwait', lat: 29.31, lon: 47.48, zoom: 2 },
        { name: 'Bahrain', lat: 26.07, lon: 50.56, zoom: 2 },
        { name: 'Jordan', lat: 30.59, lon: 36.24, zoom: 2 },
        { name: 'Lebanon', lat: 33.85, lon: 35.86, zoom: 2 },
        { name: 'Syria', lat: 34.8, lon: 38.99, zoom: 2 },
        { name: 'Armenia', lat: 40.07, lon: 45.04, zoom: 2 },
        { name: 'Azerbaijan', lat: 40.14, lon: 47.58, zoom: 2 },
        { name: 'Georgia', lat: 42.32, lon: 43.36, zoom: 2 },
        { name: 'Taiwan', lat: 23.7, lon: 121, zoom: 2 },
        
        // Central & South America - Complete
        { name: 'Costa Rica', lat: 9.75, lon: -83.75, zoom: 2 },
        { name: 'Panama', lat: 8.54, lon: -80.78, zoom: 2 },
        { name: 'Nicaragua', lat: 12.87, lon: -85.21, zoom: 2 },
        { name: 'Honduras', lat: 15.2, lon: -86.24, zoom: 2 },
        { name: 'El Salvador', lat: 13.79, lon: -88.9, zoom: 2 },
        { name: 'Belize', lat: 17.19, lon: -88.5, zoom: 2 },
        { name: 'Jamaica', lat: 18.11, lon: -77.3, zoom: 2 },
        { name: 'Haiti', lat: 18.97, lon: -72.29, zoom: 2 },
        { name: 'Dominican Republic', lat: 18.74, lon: -70.16, zoom: 2 },
        { name: 'Puerto Rico', lat: 18.22, lon: -66.59, zoom: 2 },
        { name: 'Trinidad and Tobago', lat: 10.69, lon: -61.22, zoom: 2 },
        { name: 'Bahamas', lat: 25.03, lon: -77.4, zoom: 2 },
        { name: 'Barbados', lat: 13.19, lon: -59.54, zoom: 2 },
        { name: 'Ecuador', lat: -1.83, lon: -78.18, zoom: 2 },
        { name: 'Bolivia', lat: -16.29, lon: -63.59, zoom: 2 },
        { name: 'Paraguay', lat: -23.44, lon: -58.44, zoom: 2 },
        { name: 'Uruguay', lat: -32.52, lon: -55.77, zoom: 2 },
        { name: 'Guyana', lat: 4.86, lon: -58.93, zoom: 2 },
        { name: 'Suriname', lat: 3.92, lon: -56.03, zoom: 2 },
        { name: 'French Guiana', lat: 3.93, lon: -53.13, zoom: 2 },
        
        // Europe - Complete Coverage
        { name: 'Ireland', lat: 53.41, lon: -8.24, zoom: 2 },
        { name: 'Scotland', lat: 56.49, lon: -4.2, zoom: 2 },
        { name: 'Wales', lat: 52.13, lon: -3.78, zoom: 2 },
        { name: 'Switzerland', lat: 46.82, lon: 8.23, zoom: 2 },
        { name: 'Austria', lat: 47.52, lon: 14.55, zoom: 2 },
        { name: 'Czech Republic', lat: 49.82, lon: 15.47, zoom: 2 },
        { name: 'Slovakia', lat: 48.67, lon: 19.7, zoom: 2 },
        { name: 'Hungary', lat: 47.16, lon: 19.5, zoom: 2 },
        { name: 'Slovenia', lat: 46.15, lon: 14.99, zoom: 2 },
        { name: 'Croatia', lat: 45.1, lon: 15.2, zoom: 2 },
        { name: 'Serbia', lat: 44.02, lon: 21.01, zoom: 2 },
        { name: 'Bosnia and Herzegovina', lat: 43.92, lon: 17.68, zoom: 2 },
        { name: 'Montenegro', lat: 42.71, lon: 19.37, zoom: 2 },
        { name: 'North Macedonia', lat: 41.61, lon: 21.75, zoom: 2 },
        { name: 'Albania', lat: 41.15, lon: 20.17, zoom: 2 },
        { name: 'Bulgaria', lat: 42.73, lon: 25.49, zoom: 2 },
        { name: 'Moldova', lat: 47.41, lon: 28.37, zoom: 2 },
        { name: 'Belarus', lat: 53.71, lon: 27.95, zoom: 2 },
        { name: 'Lithuania', lat: 55.17, lon: 23.88, zoom: 2 },
        { name: 'Latvia', lat: 56.88, lon: 24.6, zoom: 2 },
        { name: 'Estonia', lat: 58.6, lon: 25.01, zoom: 2 },
        { name: 'Luxembourg', lat: 49.82, lon: 6.13, zoom: 2 },
        { name: 'Monaco', lat: 43.74, lon: 7.42, zoom: 2 },
        { name: 'Andorra', lat: 42.51, lon: 1.52, zoom: 2 },
        { name: 'Liechtenstein', lat: 47.14, lon: 9.55, zoom: 2 },
        { name: 'San Marino', lat: 43.94, lon: 12.46, zoom: 2 },
        { name: 'Vatican City', lat: 41.9, lon: 12.45, zoom: 2 },
        { name: 'Malta', lat: 35.94, lon: 14.38, zoom: 2 },
        { name: 'Cyprus', lat: 35.13, lon: 33.43, zoom: 2 },
        
        // Oceania - Complete
        { name: 'Papua New Guinea', lat: -6.31, lon: 143.96, zoom: 2 },
        { name: 'Fiji', lat: -16.58, lon: 179.41, zoom: 2 },
        { name: 'Solomon Islands', lat: -9.65, lon: 160.16, zoom: 2 },
        { name: 'Vanuatu', lat: -15.38, lon: 166.96, zoom: 2 },
        { name: 'Samoa', lat: -13.76, lon: -172.1, zoom: 2 },
        { name: 'Tonga', lat: -21.18, lon: -175.2, zoom: 2 },
        { name: 'Micronesia', lat: 7.43, lon: 150.55, zoom: 2 },
        { name: 'Palau', lat: 7.51, lon: 134.58, zoom: 2 },
        { name: 'Marshall Islands', lat: 7.13, lon: 171.18, zoom: 2 },
        { name: 'Kiribati', lat: -3.37, lon: -168.73, zoom: 2 },
        { name: 'Tuvalu', lat: -7.11, lon: 177.65, zoom: 2 },
        { name: 'Nauru', lat: -0.52, lon: 166.93, zoom: 2 },
        
        // US States, Canadian Provinces, Australian States (zoom level 3)
        { name: 'Ontario', lat: 50, lon: -85, zoom: 3 },
        { name: 'Quebec', lat: 52, lon: -70, zoom: 3 },
        { name: 'British Columbia', lat: 54, lon: -125, zoom: 3 },
        { name: 'Alberta', lat: 55, lon: -115, zoom: 3 },
        { name: 'Manitoba', lat: 55, lon: -98, zoom: 3 },
        { name: 'Saskatchewan', lat: 55, lon: -106, zoom: 3 },
        { name: 'Nova Scotia', lat: 45, lon: -63, zoom: 3 },
        { name: 'New Brunswick', lat: 46.5, lon: -66, zoom: 3 },
        { name: 'Newfoundland', lat: 53, lon: -60, zoom: 3 },
        { name: 'Prince Edward Island', lat: 46.5, lon: -63.5, zoom: 3 },
        
        // Australian States - ALL with capitals
        { name: 'New South Wales', lat: -32, lon: 147, zoom: 3, capital: true },
        { name: 'Victoria', lat: -37, lon: 144, zoom: 3, capital: true },
        { name: 'Queensland', lat: -20, lon: 145, zoom: 3, capital: true },
        { name: 'Western Australia', lat: -25, lon: 122, zoom: 3, capital: true },
        { name: 'South Australia', lat: -30, lon: 135, zoom: 3, capital: true },
        { name: 'Tasmania', lat: -42, lon: 147, zoom: 3, capital: true },
        { name: 'Northern Territory', lat: -19.5, lon: 133.5, zoom: 3, capital: true },
        
        // Chinese Provinces - ALL with capitals
        { name: 'Beijing', lat: 39.9, lon: 116.4, zoom: 3, capital: true },
        { name: 'Shanghai', lat: 31.2, lon: 121.5, zoom: 3, capital: true },
        { name: 'Guangdong', lat: 23.4, lon: 113.4, zoom: 3, capital: true },
        { name: 'Sichuan', lat: 30.6, lon: 103.7, zoom: 3, capital: true },
        { name: 'Xinjiang', lat: 41.8, lon: 87, zoom: 3, capital: true },
        { name: 'Tibet', lat: 30, lon: 88, zoom: 3, capital: true },
        { name: 'Inner Mongolia', lat: 43.7, lon: 111.7, zoom: 3, capital: true },
        { name: 'Zhejiang', lat: 29.5, lon: 120.0, zoom: 3, capital: true },
        { name: 'Jiangsu', lat: 32.97, lon: 119.46, zoom: 3, capital: true },
        { name: 'Hubei', lat: 30.55, lon: 114.34, zoom: 3, capital: true },
        { name: 'Hunan', lat: 27.61, lon: 111.71, zoom: 3, capital: true },
        { name: 'Fujian', lat: 26.1, lon: 117.98, zoom: 3, capital: true },
        { name: 'Yunnan', lat: 25.04, lon: 101.49, zoom: 3, capital: true },
        
        // Indian States - ALL with capitals
        { name: 'Maharashtra', lat: 19.8, lon: 75.5, zoom: 3, capital: true },
        { name: 'Uttar Pradesh', lat: 27, lon: 80.5, zoom: 3, capital: true },
        { name: 'Karnataka', lat: 15.3, lon: 75.7, zoom: 3, capital: true },
        { name: 'Tamil Nadu', lat: 11, lon: 78.5, zoom: 3, capital: true },
        { name: 'West Bengal', lat: 23.5, lon: 87.5, zoom: 3, capital: true },
        { name: 'Gujarat', lat: 22.5, lon: 72, zoom: 3, capital: true },
        { name: 'Rajasthan', lat: 26.5, lon: 73.5, zoom: 3, capital: true },
        { name: 'Kerala', lat: 10.5, lon: 76.5, zoom: 3, capital: true },
        { name: 'Punjab', lat: 31, lon: 75.5, zoom: 3, capital: true },
        { name: 'Telangana', lat: 18.11, lon: 79.02, zoom: 3, capital: true },
        { name: 'Madhya Pradesh', lat: 22.97, lon: 78.66, zoom: 3, capital: true },
        { name: 'Bihar', lat: 25.1, lon: 85.31, zoom: 3, capital: true },
        { name: 'Odisha', lat: 20.95, lon: 85.1, zoom: 3, capital: true },
        { name: 'Assam', lat: 26.2, lon: 92.94, zoom: 3, capital: true },
        
        // Brazilian States - ALL with capitals
        { name: 'São Paulo State', lat: -23, lon: -48, zoom: 3, capital: true },
        { name: 'Rio de Janeiro State', lat: -22, lon: -43, zoom: 3, capital: true },
        { name: 'Minas Gerais', lat: -18.5, lon: -44, zoom: 3, capital: true },
        { name: 'Bahia', lat: -12.5, lon: -41.5, zoom: 3, capital: true },
        { name: 'Amazonas', lat: -3.5, lon: -64, zoom: 3, capital: true },
        { name: 'Pará', lat: -3, lon: -52, zoom: 3, capital: true },
        { name: 'Rio Grande do Sul', lat: -30.03, lon: -51.23, zoom: 3, capital: true },
        { name: 'Paraná', lat: -25.25, lon: -52.02, zoom: 3, capital: true },
        { name: 'Santa Catarina', lat: -27.33, lon: -49.44, zoom: 3, capital: true },
        { name: 'Pernambuco', lat: -8.28, lon: -35.07, zoom: 3, capital: true },
        
        // Russian Regions - ALL with capitals
        { name: 'Moscow Oblast', lat: 55.5, lon: 37.5, zoom: 3, capital: true },
        { name: 'Saint Petersburg', lat: 60, lon: 30.5, zoom: 3, capital: true },
        { name: 'Siberia', lat: 60, lon: 105, zoom: 3, capital: true },
        { name: 'Far East Russia', lat: 62, lon: 150, zoom: 3, capital: true },
        { name: 'Tatarstan', lat: 55.8, lon: 49.1, zoom: 3, capital: true },
        { name: 'Bashkortostan', lat: 54.74, lon: 56.0, zoom: 3, capital: true },
        { name: 'Krasnoyarsk Krai', lat: 64.0, lon: 95.0, zoom: 3, capital: true },
        { name: 'Sakha Republic', lat: 66.0, lon: 129.0, zoom: 3, capital: true },
        
        // Mexican States - ALL 32 with capitals
        { name: 'Aguascalientes', lat: 21.88, lon: -102.3, zoom: 3, capital: true },
        { name: 'Baja California', lat: 30.84, lon: -115.28, zoom: 3, capital: true },
        { name: 'Baja California Sur', lat: 26.04, lon: -111.67, zoom: 3, capital: true },
        { name: 'Campeche', lat: 19.83, lon: -90.53, zoom: 3, capital: true },
        { name: 'Chiapas', lat: 16.75, lon: -93.12, zoom: 3, capital: true },
        { name: 'Chihuahua', lat: 28.63, lon: -106.08, zoom: 3, capital: true },
        { name: 'Coahuila', lat: 27.06, lon: -101.71, zoom: 3, capital: true },
        { name: 'Colima', lat: 19.24, lon: -103.72, zoom: 3, capital: true },
        { name: 'Durango', lat: 24.56, lon: -104.66, zoom: 3, capital: true },
        { name: 'Guanajuato', lat: 21.02, lon: -101.26, zoom: 3, capital: true },
        { name: 'Guerrero', lat: 17.44, lon: -99.55, zoom: 3, capital: true },
        { name: 'Hidalgo', lat: 20.09, lon: -98.76, zoom: 3, capital: true },
        { name: 'Jalisco', lat: 20.66, lon: -103.35, zoom: 3, capital: true },
        { name: 'Mexico City', lat: 19.43, lon: -99.13, zoom: 3, capital: true },
        { name: 'State of Mexico', lat: 19.35, lon: -99.63, zoom: 3, capital: true },
        { name: 'Michoacán', lat: 19.57, lon: -101.71, zoom: 3, capital: true },
        { name: 'Morelos', lat: 18.68, lon: -99.1, zoom: 3, capital: true },
        { name: 'Nayarit', lat: 21.75, lon: -104.84, zoom: 3, capital: true },
        { name: 'Nuevo León', lat: 25.59, lon: -99.99, zoom: 3, capital: true },
        { name: 'Oaxaca', lat: 17.05, lon: -96.72, zoom: 3, capital: true },
        { name: 'Puebla', lat: 19.04, lon: -98.21, zoom: 3, capital: true },
        { name: 'Querétaro', lat: 20.59, lon: -100.39, zoom: 3, capital: true },
        { name: 'Quintana Roo', lat: 19.18, lon: -88.48, zoom: 3, capital: true },
        { name: 'San Luis Potosí', lat: 22.15, lon: -100.98, zoom: 3, capital: true },
        { name: 'Sinaloa', lat: 25.0, lon: -107.5, zoom: 3, capital: true },
        { name: 'Sonora', lat: 29.3, lon: -110.33, zoom: 3, capital: true },
        { name: 'Tabasco', lat: 17.98, lon: -92.93, zoom: 3, capital: true },
        { name: 'Tamaulipas', lat: 24.27, lon: -98.83, zoom: 3, capital: true },
        { name: 'Tlaxcala', lat: 19.32, lon: -98.24, zoom: 3, capital: true },
        { name: 'Veracruz', lat: 19.54, lon: -96.91, zoom: 3, capital: true },
        { name: 'Yucatán', lat: 20.71, lon: -89.09, zoom: 3, capital: true },
        { name: 'Zacatecas', lat: 22.77, lon: -102.58, zoom: 3, capital: true },
        
        // German States (zoom level 3)
        { name: 'Bavaria', lat: 48.79, lon: 11.5, zoom: 3 },
        { name: 'Baden-Württemberg', lat: 48.66, lon: 9.35, zoom: 3 },
        { name: 'North Rhine-Westphalia', lat: 51.43, lon: 7.66, zoom: 3 },
        { name: 'Saxony', lat: 51.1, lon: 13.2, zoom: 3 },
        { name: 'Lower Saxony', lat: 52.64, lon: 9.84, zoom: 3 },
        
        // French Regions (zoom level 3)
        { name: 'Île-de-France', lat: 48.85, lon: 2.35, zoom: 3 },
        { name: 'Provence', lat: 43.93, lon: 6.07, zoom: 3 },
        { name: 'Normandy', lat: 49.18, lon: 0.37, zoom: 3 },
        { name: 'Brittany', lat: 48.2, lon: -2.93, zoom: 3 },
        
        // Spanish Regions (zoom level 3)
        { name: 'Catalonia', lat: 41.59, lon: 1.52, zoom: 3 },
        { name: 'Andalusia', lat: 37.39, lon: -5.98, zoom: 3 },
        { name: 'Madrid Region', lat: 40.42, lon: -3.7, zoom: 3 },
        { name: 'Basque Country', lat: 43.0, lon: -2.64, zoom: 3 },
        
        // Italian Regions (zoom level 3)
        { name: 'Lombardy', lat: 45.58, lon: 9.27, zoom: 3 },
        { name: 'Lazio', lat: 41.9, lon: 12.5, zoom: 3 },
        { name: 'Sicily', lat: 37.6, lon: 14.01, zoom: 3 },
        { name: 'Tuscany', lat: 43.77, lon: 11.25, zoom: 3 },
        
        // Japanese Prefectures (zoom level 3)
        { name: 'Tokyo Prefecture', lat: 35.68, lon: 139.69, zoom: 3 },
        { name: 'Osaka Prefecture', lat: 34.69, lon: 135.5, zoom: 3 },
        { name: 'Hokkaido', lat: 43.06, lon: 141.35, zoom: 3 },
        { name: 'Kyoto Prefecture', lat: 35.02, lon: 135.75, zoom: 3 },
        { name: 'Aichi Prefecture', lat: 35.18, lon: 136.91, zoom: 3 },
        { name: 'Fukuoka Prefecture', lat: 33.61, lon: 130.42, zoom: 3 },
        
        // Argentina Provinces (zoom level 3)
        { name: 'Buenos Aires Province', lat: -36.68, lon: -60.56, zoom: 3 },
        { name: 'Córdoba', lat: -31.42, lon: -64.19, zoom: 3 },
        { name: 'Santa Fe', lat: -31.62, lon: -60.69, zoom: 3 },
        { name: 'Mendoza', lat: -32.89, lon: -68.84, zoom: 3 },
        { name: 'Patagonia', lat: -41, lon: -69, zoom: 3 },
        
        // Colombian Departments (zoom level 3)
        { name: 'Cundinamarca', lat: 5.03, lon: -74.03, zoom: 3 },
        { name: 'Antioquia', lat: 7.0, lon: -75.5, zoom: 3 },
        { name: 'Valle del Cauca', lat: 3.8, lon: -76.5, zoom: 3 },
        
        // UK Regions (zoom level 3)
        { name: 'England', lat: 52.5, lon: -1.5, zoom: 3 },
        { name: 'Northern Ireland', lat: 54.6, lon: -6.5, zoom: 3 },
        
        // South African Provinces (zoom level 3)
        { name: 'Gauteng', lat: -26.27, lon: 28.11, zoom: 3 },
        { name: 'Western Cape', lat: -33.92, lon: 18.42, zoom: 3 },
        { name: 'KwaZulu-Natal', lat: -28.53, lon: 30.9, zoom: 3 },
        
        // Nigerian States (zoom level 3)
        { name: 'Lagos State', lat: 6.52, lon: 3.38, zoom: 3 },
        { name: 'Kano State', lat: 12.0, lon: 8.52, zoom: 3 },
        { name: 'Rivers State', lat: 4.82, lon: 6.91, zoom: 3 },
        
        // Additional Russian Regions (zoom level 3)
        { name: 'Tatarstan', lat: 55.8, lon: 49.1, zoom: 3 },
        { name: 'Bashkortostan', lat: 54.74, lon: 56.0, zoom: 3 },
        { name: 'Krasnoyarsk Krai', lat: 64.0, lon: 95.0, zoom: 3 },
        { name: 'Sakha Republic', lat: 66.0, lon: 129.0, zoom: 3 },
        

        
        // Chilean Regions - with capitals
        { name: 'Santiago Metropolitan', lat: -33.45, lon: -70.67, zoom: 3, capital: true },
        { name: 'Valparaíso', lat: -33.05, lon: -71.62, zoom: 3, capital: true },
        
        // Peruvian Regions - with capitals
        { name: 'Lima Region', lat: -12.05, lon: -77.04, zoom: 3, capital: true },
        { name: 'Cusco', lat: -13.53, lon: -71.97, zoom: 3, capital: true },
        
        // Polish Voivodeships - with capitals
        { name: 'Masovian', lat: 51.92, lon: 21.07, zoom: 3, capital: true },
        { name: 'Silesian', lat: 50.81, lon: 19.02, zoom: 3, capital: true },
        
        // Ukrainian Oblasts - with capitals
        { name: 'Kyiv Oblast', lat: 50.45, lon: 30.52, zoom: 3, capital: true },
        { name: 'Lviv Oblast', lat: 49.84, lon: 24.03, zoom: 3, capital: true },
        
        // Turkish Provinces - with capitals
        { name: 'Istanbul Province', lat: 41.01, lon: 28.98, zoom: 3, capital: true },
        { name: 'Ankara Province', lat: 39.93, lon: 32.86, zoom: 3, capital: true },
        
        // Indonesian Provinces - with capitals
        { name: 'Java', lat: -7.5, lon: 110.0, zoom: 3, capital: true },
        { name: 'Sumatra', lat: 0.5, lon: 101.5, zoom: 3, capital: true },
        { name: 'Bali', lat: -8.34, lon: 115.09, zoom: 3, capital: true },
        
        // Argentina Provinces - with capitals
        { name: 'Buenos Aires Province', lat: -36.68, lon: -60.56, zoom: 3, capital: true },
        { name: 'Córdoba', lat: -31.42, lon: -64.19, zoom: 3, capital: true },
        { name: 'Santa Fe', lat: -31.62, lon: -60.69, zoom: 3, capital: true },
        { name: 'Mendoza', lat: -32.89, lon: -68.84, zoom: 3, capital: true },
        
        // Colombian Departments - with capitals
        { name: 'Cundinamarca', lat: 5.03, lon: -74.03, zoom: 3, capital: true },
        { name: 'Antioquia', lat: 7.0, lon: -75.5, zoom: 3, capital: true },
        { name: 'Valle del Cauca', lat: 3.8, lon: -76.5, zoom: 3, capital: true },
        
        // UK Regions - with capitals
        { name: 'England', lat: 52.5, lon: -1.5, zoom: 3, capital: true },
        { name: 'Scotland', lat: 56.49, lon: -4.2, zoom: 3, capital: true },
        { name: 'Wales', lat: 52.13, lon: -3.78, zoom: 3, capital: true },
        { name: 'Northern Ireland', lat: 54.6, lon: -6.5, zoom: 3, capital: true },
        
        // South African Provinces - with capitals
        { name: 'Gauteng', lat: -26.27, lon: 28.11, zoom: 3, capital: true },
        { name: 'Western Cape', lat: -33.92, lon: 18.42, zoom: 3, capital: true },
        { name: 'KwaZulu-Natal', lat: -28.53, lon: 30.9, zoom: 3, capital: true },
        
        // Nigerian States - with capitals
        { name: 'Lagos State', lat: 6.52, lon: 3.38, zoom: 3, capital: true },
        { name: 'Kano State', lat: 12.0, lon: 8.52, zoom: 3, capital: true },
        { name: 'Rivers State', lat: 4.82, lon: 6.91, zoom: 3, capital: true },
        
        // German States - with capitals
        { name: 'Bavaria', lat: 48.79, lon: 11.5, zoom: 3, capital: true },
        { name: 'Baden-Württemberg', lat: 48.66, lon: 9.35, zoom: 3, capital: true },
        { name: 'North Rhine-Westphalia', lat: 51.43, lon: 7.66, zoom: 3, capital: true },
        { name: 'Saxony', lat: 51.1, lon: 13.2, zoom: 3, capital: true },
        { name: 'Lower Saxony', lat: 52.64, lon: 9.84, zoom: 3, capital: true },
        
        // French Regions - with capitals
        { name: 'Île-de-France', lat: 48.85, lon: 2.35, zoom: 3, capital: true },
        { name: 'Provence', lat: 43.93, lon: 6.07, zoom: 3, capital: true },
        { name: 'Normandy', lat: 49.18, lon: 0.37, zoom: 3, capital: true },
        { name: 'Brittany', lat: 48.2, lon: -2.93, zoom: 3, capital: true },
        
        // Spanish Regions - with capitals
        { name: 'Catalonia', lat: 41.59, lon: 1.52, zoom: 3, capital: true },
        { name: 'Andalusia', lat: 37.39, lon: -5.98, zoom: 3, capital: true },
        { name: 'Madrid Region', lat: 40.42, lon: -3.7, zoom: 3, capital: true },
        { name: 'Basque Country', lat: 43.0, lon: -2.64, zoom: 3, capital: true },
        
        // Italian Regions - with capitals
        { name: 'Lombardy', lat: 45.58, lon: 9.27, zoom: 3, capital: true },
        { name: 'Lazio', lat: 41.9, lon: 12.5, zoom: 3, capital: true },
        { name: 'Sicily', lat: 37.6, lon: 14.01, zoom: 3, capital: true },
        { name: 'Tuscany', lat: 43.77, lon: 11.25, zoom: 3, capital: true },
        
        // Japanese Prefectures - with capitals
        { name: 'Tokyo Prefecture', lat: 35.68, lon: 139.69, zoom: 3, capital: true },
        { name: 'Osaka Prefecture', lat: 34.69, lon: 135.5, zoom: 3, capital: true },
        { name: 'Hokkaido', lat: 43.06, lon: 141.35, zoom: 3, capital: true },
        { name: 'Kyoto Prefecture', lat: 35.02, lon: 135.75, zoom: 3, capital: true },
        { name: 'Aichi Prefecture', lat: 35.18, lon: 136.91, zoom: 3, capital: true },
        { name: 'Fukuoka Prefecture', lat: 33.61, lon: 130.42, zoom: 3, capital: true },
        
        // Poles
        { name: 'North Pole', lat: 90, lon: 0, zoom: 2, priority: 2 },
        { name: 'South Pole', lat: -90, lon: 0, zoom: 2, priority: 2 },
        { name: 'Greenland', lat: 72, lon: -40, zoom: 2 },
        { name: 'Iceland', lat: 65, lon: -18, zoom: 2 },
        { name: 'Antarctica', lat: -80, lon: 0, zoom: 2 },
        { name: 'Svalbard', lat: 78, lon: 20, zoom: 2 },
        
        // All 50 US States with Capitals (zoom level 3)
        // All 50 US States - ALL with capital markers
        { name: 'Alabama', lat: 32.8, lon: -86.9, zoom: 3, capital: true },
        { name: 'Alaska', lat: 64, lon: -153, zoom: 3, capital: true },
        { name: 'Arizona', lat: 34.3, lon: -111.7, zoom: 3, capital: true },
        { name: 'Arkansas', lat: 35, lon: -92.4, zoom: 3, capital: true },
        { name: 'California', lat: 36.7, lon: -119.7, zoom: 3, capital: true },
        { name: 'Colorado', lat: 39, lon: -105.5, zoom: 3, capital: true },
        { name: 'Connecticut', lat: 41.6, lon: -72.7, zoom: 3, capital: true },
        { name: 'Delaware', lat: 39, lon: -75.5, zoom: 3, capital: true },
        { name: 'Florida', lat: 27.6, lon: -81.5, zoom: 3, capital: true },
        { name: 'Georgia', lat: 33, lon: -83.5, zoom: 3, capital: true },
        { name: 'Hawaii', lat: 20.5, lon: -157, zoom: 3, capital: true },
        { name: 'Idaho', lat: 44.5, lon: -114.5, zoom: 3, capital: true },
        { name: 'Illinois', lat: 40, lon: -89, zoom: 3, capital: true },
        { name: 'Indiana', lat: 40, lon: -86.3, zoom: 3, capital: true },
        { name: 'Iowa', lat: 42, lon: -93.5, zoom: 3, capital: true },
        { name: 'Kansas', lat: 38.5, lon: -98, zoom: 3, capital: true },
        { name: 'Kentucky', lat: 37.5, lon: -85, zoom: 3, capital: true },
        { name: 'Louisiana', lat: 31, lon: -92, zoom: 3, capital: true },
        { name: 'Maine', lat: 45, lon: -69, zoom: 3, capital: true },
        { name: 'Maryland', lat: 39, lon: -76.8, zoom: 3, capital: true },
        { name: 'Massachusetts', lat: 42.4, lon: -71.4, zoom: 3, capital: true },
        { name: 'Michigan', lat: 44.3, lon: -85.6, zoom: 3, capital: true },
        { name: 'Minnesota', lat: 46, lon: -94.5, zoom: 3, capital: true },
        { name: 'Mississippi', lat: 33, lon: -90, zoom: 3, capital: true },
        { name: 'Missouri', lat: 38.5, lon: -92.5, zoom: 3, capital: true },
        { name: 'Montana', lat: 47, lon: -110, zoom: 3, capital: true },
        { name: 'Nebraska', lat: 41.5, lon: -99.9, zoom: 3, capital: true },
        { name: 'Nevada', lat: 39, lon: -117, zoom: 3, capital: true },
        { name: 'New Hampshire', lat: 44, lon: -71.5, zoom: 3, capital: true },
        { name: 'New Jersey', lat: 40, lon: -74.5, zoom: 3, capital: true },
        { name: 'New Mexico', lat: 34.5, lon: -106, zoom: 3, capital: true },
        { name: 'New York', lat: 43, lon: -75, zoom: 3, capital: true },
        { name: 'North Carolina', lat: 35.5, lon: -80, zoom: 3, capital: true },
        { name: 'North Dakota', lat: 47.5, lon: -100.5, zoom: 3, capital: true },
        { name: 'Ohio', lat: 40.4, lon: -82.9, zoom: 3, capital: true },
        { name: 'Oklahoma', lat: 36, lon: -97.5, zoom: 3, capital: true },
        { name: 'Oregon', lat: 44, lon: -120.5, zoom: 3, capital: true },
        { name: 'Pennsylvania', lat: 41, lon: -77.5, zoom: 3, capital: true },
        { name: 'Rhode Island', lat: 41.7, lon: -71.5, zoom: 3, capital: true },
        { name: 'South Carolina', lat: 34, lon: -81, zoom: 3, capital: true },
        { name: 'South Dakota', lat: 44.5, lon: -100, zoom: 3, capital: true },
        { name: 'Tennessee', lat: 36, lon: -86, zoom: 3, capital: true },
        { name: 'Texas', lat: 31, lon: -100, zoom: 3, capital: true },
        { name: 'Utah', lat: 39.5, lon: -111.5, zoom: 3, capital: true },
        { name: 'Vermont', lat: 44, lon: -72.7, zoom: 3, capital: true },
        { name: 'Virginia', lat: 37.5, lon: -78.6, zoom: 3, capital: true },
        { name: 'Washington', lat: 47.5, lon: -120.5, zoom: 3, capital: true },
        { name: 'West Virginia', lat: 38.5, lon: -80.5, zoom: 3, capital: true },
        { name: 'Wisconsin', lat: 44.5, lon: -90, zoom: 3, capital: true },
        { name: 'Wyoming', lat: 43, lon: -107.5, zoom: 3, capital: true },
        { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, zoom: 4 },
        { name: 'Chicago', lat: 41.8781, lon: -87.6298, zoom: 4 },
        { name: 'Houston', lat: 29.7604, lon: -95.3698, zoom: 4 },
        { name: 'Phoenix', lat: 33.4484, lon: -112.074, zoom: 4 },
        { name: 'Philadelphia', lat: 39.9526, lon: -75.1652, zoom: 4 },
        { name: 'San Antonio', lat: 29.4241, lon: -98.4936, zoom: 4 },
        { name: 'San Diego', lat: 32.7157, lon: -117.1611, zoom: 4 },
        { name: 'Dallas', lat: 32.7767, lon: -96.797, zoom: 4 },
        { name: 'San Jose', lat: 37.3382, lon: -121.8863, zoom: 4 },
        { name: 'Austin', lat: 30.2672, lon: -97.7431, zoom: 4 },
        { name: 'Seattle', lat: 47.6062, lon: -122.3321, zoom: 4 },
        { name: 'Miami', lat: 25.7617, lon: -80.1918, zoom: 4 },
        { name: 'Boston', lat: 42.3601, lon: -71.0589, zoom: 4 },
        { name: 'Atlanta', lat: 33.749, lon: -84.388, zoom: 4 },
        { name: 'Denver', lat: 39.7392, lon: -104.9903, zoom: 4 },
        { name: 'Las Vegas', lat: 36.1699, lon: -115.1398, zoom: 4 },
        { name: 'Portland', lat: 45.5152, lon: -122.6784, zoom: 4 },
        
        // Europe Cities
        { name: 'London', lat: 51.5074, lon: -0.1278, zoom: 4 },
        { name: 'Paris', lat: 48.8566, lon: 2.3522, zoom: 4 },
        { name: 'Berlin', lat: 52.52, lon: 13.405, zoom: 4 },
        { name: 'Madrid', lat: 40.4168, lon: -3.7038, zoom: 4 },
        { name: 'Rome', lat: 41.9028, lon: 12.4964, zoom: 4 },
        { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, zoom: 4 },
        { name: 'Vienna', lat: 48.2082, lon: 16.3738, zoom: 4 },
        { name: 'Brussels', lat: 50.8503, lon: 4.3517, zoom: 4 },
        { name: 'Stockholm', lat: 59.3293, lon: 18.0686, zoom: 4 },
        { name: 'Copenhagen', lat: 55.6761, lon: 12.5683, zoom: 4 },
        { name: 'Dublin', lat: 53.3498, lon: -6.2603, zoom: 4 },
        { name: 'Lisbon', lat: 38.7223, lon: -9.1393, zoom: 4 },
        { name: 'Athens', lat: 37.9838, lon: 23.7275, zoom: 4 },
        { name: 'Prague', lat: 50.0755, lon: 14.4378, zoom: 4 },
        { name: 'Warsaw', lat: 52.2297, lon: 21.0122, zoom: 4 },
        { name: 'Budapest', lat: 47.4979, lon: 19.0402, zoom: 4 },
        { name: 'Bucharest', lat: 44.4268, lon: 26.1025, zoom: 4 },
        { name: 'Sofia', lat: 42.6977, lon: 23.3219, zoom: 4 },
        { name: 'Oslo', lat: 59.9139, lon: 10.7522, zoom: 4 },
        { name: 'Helsinki', lat: 60.1699, lon: 24.9384, zoom: 4 },
        { name: 'Zurich', lat: 47.3769, lon: 8.5417, zoom: 4 },
        { name: 'Geneva', lat: 46.2044, lon: 6.1432, zoom: 4 },
        { name: 'Milan', lat: 45.4642, lon: 9.1900, zoom: 4 },
        { name: 'Naples', lat: 40.8518, lon: 14.2681, zoom: 4 },
        { name: 'Venice', lat: 45.4408, lon: 12.3155, zoom: 4 },
        { name: 'Barcelona', lat: 41.3851, lon: 2.1734, zoom: 4 },
        { name: 'Seville', lat: 37.3891, lon: -5.9845, zoom: 4 },
        { name: 'Porto', lat: 41.1579, lon: -8.6291, zoom: 4 },
        { name: 'Edinburgh', lat: 55.9533, lon: -3.1883, zoom: 4 },
        { name: 'Manchester', lat: 53.4808, lon: -2.2426, zoom: 4 },
        { name: 'Lyon', lat: 45.7640, lon: 4.8357, zoom: 4 },
        { name: 'Marseille', lat: 43.2965, lon: 5.3698, zoom: 4 },
        { name: 'Munich', lat: 48.1351, lon: 11.5820, zoom: 4 },
        { name: 'Frankfurt', lat: 50.1109, lon: 8.6821, zoom: 4 },

        { name: 'Beijing', lat: 39.9042, lon: 116.4074, zoom: 4 },
        { name: 'Shanghai', lat: 31.2304, lon: 121.4737, zoom: 4 },
        { name: 'Seoul', lat: 37.5665, lon: 126.978, zoom: 4 },
        { name: 'Mumbai', lat: 19.076, lon: 72.8777, zoom: 4 },
        { name: 'Delhi', lat: 28.7041, lon: 77.1025, zoom: 4 },
        { name: 'Bangalore', lat: 12.9716, lon: 77.5946, zoom: 4 },
        { name: 'Bangkok', lat: 13.7563, lon: 100.5018, zoom: 4 },
        { name: 'Singapore', lat: 1.3521, lon: 103.8198, zoom: 4 },
        { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, zoom: 4 },
        { name: 'Dubai', lat: 25.2048, lon: 55.2708, zoom: 4 },
        { name: 'Tel Aviv', lat: 32.0853, lon: 34.7818, zoom: 4 },
        { name: 'Istanbul', lat: 41.0082, lon: 28.9784, zoom: 4 },
        { name: 'Manila', lat: 14.5995, lon: 120.9842, zoom: 4 },
        { name: 'Jakarta', lat: -6.2088, lon: 106.8456, zoom: 4 },
        { name: 'Kuala Lumpur', lat: 3.139, lon: 101.6869, zoom: 4 },
        { name: 'Hanoi', lat: 21.0285, lon: 105.8542, zoom: 4 },
        { name: 'Ho Chi Minh City', lat: 10.8231, lon: 106.6297, zoom: 4 },
        { name: 'Taipei', lat: 25.0330, lon: 121.5654, zoom: 4 },
        { name: 'Osaka', lat: 34.6937, lon: 135.5023, zoom: 4 },
        { name: 'Kyoto', lat: 35.0116, lon: 135.7681, zoom: 4 },
        { name: 'Busan', lat: 35.1796, lon: 129.0756, zoom: 4 },
        { name: 'Chengdu', lat: 30.5728, lon: 104.0668, zoom: 4 },
        { name: 'Shenzhen', lat: 22.5431, lon: 114.0579, zoom: 4 },
        { name: 'Guangzhou', lat: 23.1291, lon: 113.2644, zoom: 4 },
        { name: 'Kolkata', lat: 22.5726, lon: 88.3639, zoom: 4 },
        { name: 'Chennai', lat: 13.0827, lon: 80.2707, zoom: 4 },
        { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, zoom: 4 },
        { name: 'Pune', lat: 18.5204, lon: 73.8567, zoom: 4 },
        { name: 'Karachi', lat: 24.8607, lon: 67.0011, zoom: 4 },
        { name: 'Lahore', lat: 31.5497, lon: 74.3436, zoom: 4 },
        { name: 'Dhaka', lat: 23.8103, lon: 90.4125, zoom: 4 },
        { name: 'Kathmandu', lat: 27.7172, lon: 85.3240, zoom: 4 },
        { name: 'Colombo', lat: 6.9271, lon: 79.8612, zoom: 4 },
        { name: 'Riyadh', lat: 24.7136, lon: 46.6753, zoom: 4 },
        { name: 'Jeddah', lat: 21.5433, lon: 39.1728, zoom: 4 },
        { name: 'Tehran', lat: 35.6892, lon: 51.3890, zoom: 4 },
        { name: 'Baghdad', lat: 33.3152, lon: 44.3661, zoom: 4 },
        { name: 'Jerusalem', lat: 31.7683, lon: 35.2137, zoom: 4 },
        { name: 'Ankara', lat: 39.9334, lon: 32.8597, zoom: 4 },

        { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, zoom: 4 },
        { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816, zoom: 4 },
        { name: 'Lima', lat: -12.0464, lon: -77.0428, zoom: 4 },
        { name: 'Bogotá', lat: 4.711, lon: -74.0721, zoom: 4 },
        { name: 'Santiago', lat: -33.4489, lon: -70.6693, zoom: 4 },
        { name: 'Caracas', lat: 10.4806, lon: -66.9036, zoom: 4 },
        { name: 'Montevideo', lat: -34.9011, lon: -56.1645, zoom: 4 },
        { name: 'Quito', lat: -0.1807, lon: -78.4678, zoom: 4 },
        { name: 'La Paz', lat: -16.5000, lon: -68.1500, zoom: 4 },

        { name: 'Lagos', lat: 6.5244, lon: 3.3792, zoom: 4 },
        { name: 'Johannesburg', lat: -26.2041, lon: 28.0473, zoom: 4 },
        { name: 'Cape Town', lat: -33.9249, lon: 18.4241, zoom: 4 },
        { name: 'Nairobi', lat: -1.2864, lon: 36.8172, zoom: 4 },
        { name: 'Addis Ababa', lat: 9.0320, lon: 38.7469, zoom: 4 },
        { name: 'Kinshasa', lat: -4.4419, lon: 15.2663, zoom: 4 },
        { name: 'Accra', lat: 5.6037, lon: -0.1870, zoom: 4 },
        { name: 'Casablanca', lat: 33.5731, lon: -7.5898, zoom: 4 },
        { name: 'Algiers', lat: 36.7538, lon: 3.0588, zoom: 4 },
        { name: 'Tunis', lat: 36.8065, lon: 10.1815, zoom: 4 },
        { name: 'Tripoli', lat: 32.8872, lon: 13.1913, zoom: 4 },
        { name: 'Khartoum', lat: 15.5007, lon: 32.5599, zoom: 4 },
        { name: 'Dar es Salaam', lat: -6.7924, lon: 39.2083, zoom: 4 },
        { name: 'Kampala', lat: 0.3476, lon: 32.5825, zoom: 4 },
        { name: 'Lusaka', lat: -15.3875, lon: 28.3228, zoom: 4 },
        { name: 'Harare', lat: -17.8252, lon: 31.0335, zoom: 4 },

        { name: 'Melbourne', lat: -37.8136, lon: 144.9631, zoom: 4 },
        { name: 'Brisbane', lat: -27.4698, lon: 153.0251, zoom: 4 },
        { name: 'Perth', lat: -31.9505, lon: 115.8605, zoom: 4 },
        { name: 'Auckland', lat: -36.8485, lon: 174.7633, zoom: 4 },
        { name: 'Wellington', lat: -41.2865, lon: 174.7762, zoom: 4 },
        { name: 'Christchurch', lat: -43.5321, lon: 172.6362, zoom: 4 },
        { name: 'Adelaide', lat: -34.9285, lon: 138.6007, zoom: 4 },
        { name: 'Canberra', lat: -35.2809, lon: 149.1300, zoom: 4 },
        { name: 'Gold Coast', lat: -28.0167, lon: 153.4000, zoom: 4 },
        { name: 'Darwin', lat: -12.4634, lon: 130.8456, zoom: 4 }
      ];

      locations.forEach(loc => {
        const label = createLabel(
          loc.name, 
          loc.lat, 
          loc.lon, 
          loc.zoom || 2,
          loc.priority || 1,
          loc.capital || false
        );
        label.userData.isOcean = loc.ocean || false;
        labels.push(label);
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
    const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
    const markerMaterialFree = new THREE.MeshPhongMaterial({ 
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.5,
      shininess: 100
    });
    const markerMaterialHovered = new THREE.MeshPhongMaterial({ 
      color: 0x059669,
      emissive: 0x059669,
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
        
        const material = user.plan === 'pro' ? markerMaterialPro.clone() : markerMaterialFree.clone();
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
    
    // Smooth fade-in animation after everything loads
    setTimeout(() => {
      setIsGlobeLoading(false);
    }, 300);

    // Mouse move for hover detection
    const handleMouseMove = (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    // Click detection with Google Maps integration
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
      } else {
        // Check if clicked on disaster marker
        const disasterIntersects = raycasterRef.current.intersectObjects(disasterMarkersRef.current);
        if (disasterIntersects.length > 0 && disasterIntersects[0].object.userData.isDisaster) {
          const disaster = disasterIntersects[0].object.userData.disaster;
          setSelectedLocation({
            type: 'disaster',
            data: disaster,
            lat: disaster.lat,
            lon: disaster.lon
          });
          controls.autoRotate = false;
          return;
        }

        // Check for weather marker click
        const weatherIntersects = raycasterRef.current.intersectObjects(weatherMarkersRef.current);
        if (weatherIntersects.length > 0 && weatherIntersects[0].object.userData.isWeather) {
          const weather = weatherIntersects[0].object.userData.weather;
          setSelectedLocation({
            type: 'weather',
            data: weather,
            lat: weather.lat,
            lon: weather.lon
          });
          controls.autoRotate = false;
          return;
        }

        // Check for label click
        const labelIntersects = raycasterRef.current.intersectObjects(labelsRef.current, true);
        if (labelIntersects.length > 0) {
          const label = labelIntersects[0].object;
          if (label.userData.isLabel) {
            setSelectedLocation({
              type: 'location',
              data: {
                name: label.userData.text,
                lat: label.userData.lat,
                lon: label.userData.lon
              },
              lat: label.userData.lat,
              lon: label.userData.lon
            });
            controls.autoRotate = false;
            return;
          }
        }
      }
    };

    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('click', handleClick);

    // Animation loop
    let animationId;
    let animationTime = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      animationTime += 0.016; // ~60fps
      
      // Smooth entry animation
      if (animationTime < 1.5) {
        const progress = Math.min(animationTime / 1.5, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        sphere.scale.set(0.8 + easeProgress * 0.2, 0.8 + easeProgress * 0.2, 0.8 + easeProgress * 0.2);
        atmosphere1.scale.set(easeProgress, easeProgress, easeProgress);
        atmosphere2.scale.set(easeProgress, easeProgress, easeProgress);
      }
      
      // Update controls
      controls.update();
      
      // Animate clouds slowly
      if (clouds && globeStyle === 'earth') {
        clouds.rotation.y += 0.0002;
      }
      
      // Update sun and terminator in real-time
      if (sunRef.current && terminatorRef.current) {
        const now = new Date();
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
        const declination = 23.45 * Math.sin((360/365) * (dayOfYear - 81) * Math.PI / 180);
        const hours = now.getUTCHours();
        const minutes = now.getUTCMinutes();
        const seconds = now.getUTCSeconds();
        const timeDecimal = hours + minutes/60 + seconds/3600;
        const longitude = (timeDecimal - 12) * 15;
        
        const sunPhi = (90 - declination) * (Math.PI / 180);
        const sunTheta = (longitude + 180) * (Math.PI / 180);
        const newSunDirection = new THREE.Vector3(
          -Math.sin(sunPhi) * Math.cos(sunTheta),
          Math.cos(sunPhi),
          Math.sin(sunPhi) * Math.sin(sunTheta)
        );
        
        sunRef.current.position.copy(newSunDirection.clone().multiplyScalar(2.5));
        terminatorRef.current.material.uniforms.sunDirection.value.copy(newSunDirection);
      }
      
      // Update sun position based on real UTC time
      if (sunRef.current) {
        const currentSunPos = calculateSunPosition(currentTime);
        const sunPhi = (90 - currentSunPos.lat) * (Math.PI / 180);
        const sunTheta = (currentSunPos.lon + 180) * (Math.PI / 180);
        const newSunDirection = new THREE.Vector3(
          -Math.sin(sunPhi) * Math.cos(sunTheta),
          Math.cos(sunPhi),
          Math.sin(sunPhi) * Math.sin(sunTheta)
        );
        sunRef.current.position.copy(newSunDirection.clone().multiplyScalar(2.5));
        
        // Update terminator shader
        if (terminator) {
          terminator.material.uniforms.sunDirection.value.copy(newSunDirection);
        }
      }
      
      // Update ISS position
      if (issMarkerRef.current && issPosition) {
        const phi = (90 - issPosition.lat) * (Math.PI / 180);
        const theta = (issPosition.lon + 180 + animationTime * 0.5) * (Math.PI / 180);
        const radius = 1.1;
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        issMarkerRef.current.position.set(x, y, z);
        
        // Pulse ISS
        const scale = 1 + Math.sin(animationTime * 3) * 0.3;
        issMarkerRef.current.scale.set(scale, scale, scale);
      }
      
      // Animate storms rotating
      stormMarkersRef.current.forEach(marker => {
        marker.rotation.z += 0.05;
      });
      
      // Pulse user activity heatmap
      heatmapRef.current.forEach((marker, idx) => {
        const pulse = 1 + Math.sin(animationTime * 2 + idx) * 0.15;
        marker.scale.set(pulse, pulse, 1);
      });
      
      // Update ISS position
      if (issMarkerRef.current && issPosition) {
        const phi = (90 - issPosition.lat) * (Math.PI / 180);
        const theta = (issPosition.lon + 180 + animationTime * 0.5) * (Math.PI / 180);
        const radius = 1.1;
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        issMarkerRef.current.position.set(x, y, z);
        
        // Pulse ISS
        const scale = 1 + Math.sin(animationTime * 3) * 0.3;
        issMarkerRef.current.scale.set(scale, scale, scale);
      }
      
      // Update sun position in real-time
      if (sunRef.current) {
        const sunPos = calculateSunPosition(currentTime);
        const sunPhi = (90 - sunPos.lat) * (Math.PI / 180);
        const sunTheta = (sunPos.lon + 180) * (Math.PI / 180);
        const sunDirection = new THREE.Vector3(
          -Math.sin(sunPhi) * Math.cos(sunTheta),
          Math.cos(sunPhi),
          Math.sin(sunPhi) * Math.sin(sunTheta)
        );
        sunRef.current.position.copy(sunDirection.clone().multiplyScalar(2.5));
      }
      
      // Animate storms
      if (showStormTracks) {
        stormMarkersRef.current.forEach(marker => {
          marker.rotation.z += 0.05;
        });
      }
      
      // Pulse heatmap
      if (heatmapRef.current.length > 0) {
        heatmapRef.current.forEach(marker => {
          const pulse = 1 + Math.sin(animationTime * 2 + marker.position.x) * 0.1;
          marker.scale.set(pulse, pulse, 1);
        });
      }
      
      // Animate wind particles
      if (showWindLayer) {
        windParticlesRef.current.forEach(particle => {
          particle.userData.angle += particle.userData.speed;
          const currentPos = particle.position.clone().normalize();
          const axis = new THREE.Vector3(0, 1, 0);
          const rotationMatrix = new THREE.Matrix4().makeRotationAxis(axis, particle.userData.speed);
          particle.position.applyMatrix4(rotationMatrix);
          particle.position.normalize().multiplyScalar(1.06);
        });
      }

      // Google Earth-style intelligent label visibility with collision detection
      const cameraDistance = camera.position.distanceTo(scene.position);
      
      if (showLabels) {
        // Step 1: Determine which labels should be visible based on zoom
        const visibleLabels = [];
        labelsRef.current.forEach(label => {
          const zoomLevel = label.userData.zoomLevel;
          let shouldShow = false;
          
          // Precise zoom thresholds (Google Earth style)
          if (label.userData.isOcean) {
            shouldShow = cameraDistance > 3.8;
          } else if (zoomLevel === 2) { // Countries
            shouldShow = cameraDistance > 2.6;
          } else if (zoomLevel === 3) { // States
            shouldShow = cameraDistance <= 2.8;
          }
          
          if (shouldShow) {
            // Check if label is facing camera
            const labelPos = new THREE.Vector3();
            label.getWorldPosition(labelPos);
            const dirToCamera = new THREE.Vector3().subVectors(camera.position, labelPos).normalize();
            const labelNormal = labelPos.clone().normalize();
            const dot = dirToCamera.dot(labelNormal);
            
            if (dot > 0.3) { // Label is facing camera
              visibleLabels.push({
                label,
                screenPos: labelPos.clone().project(camera),
                priority: label.userData.priority || 1
              });
            }
          }
        });
        
        // Step 2: Sort by priority (higher priority = show first)
        visibleLabels.sort((a, b) => b.priority - a.priority);
        
        // Step 3: Collision detection - prevent label overlap
        const occupiedAreas = [];
        const labelSpacing = 0.15; // Minimum distance between labels on screen
        
        visibleLabels.forEach(({ label, screenPos }) => {
          let hasCollision = false;
          
          // Check against already shown labels
          for (const occupied of occupiedAreas) {
            const dist = Math.sqrt(
              Math.pow(screenPos.x - occupied.x, 2) + 
              Math.pow(screenPos.y - occupied.y, 2)
            );
            if (dist < labelSpacing) {
              hasCollision = true;
              break;
            }
          }
          
          // Set target opacity
          const targetOpacity = hasCollision ? 0 : 0.95;
          
          if (!hasCollision) {
            occupiedAreas.push({ x: screenPos.x, y: screenPos.y });
          }
          
          // Smooth transition
          if (Math.abs(label.material.opacity - targetOpacity) > 0.02) {
            label.material.opacity += (targetOpacity - label.material.opacity) * 0.15;
          }
        });
        
        // Step 4: Hide labels not in visible list
        labelsRef.current.forEach(label => {
          if (!visibleLabels.find(v => v.label === label)) {
            if (label.material.opacity > 0.02) {
              label.material.opacity *= 0.85;
            } else {
              label.material.opacity = 0;
            }
          }
        });
      } else {
        // Hide all labels when showLabels is false
        labelsRef.current.forEach(label => {
          if (label.material.opacity > 0.02) {
            label.material.opacity *= 0.9;
          } else {
            label.material.opacity = 0;
          }
        });
      }

      // Pulse disaster markers
      disasterMarkersRef.current.forEach(marker => {
        marker.userData.pulsePhase += 0.08;
        const scale = 1 + Math.sin(marker.userData.pulsePhase) * 0.5;
        marker.scale.set(scale, scale, scale);
      });

      // Pulse Pro markers
      markers.forEach(marker => {
        if (marker.userData.user?.plan === 'pro' && marker.userData.pulsePhase !== undefined) {
          marker.userData.pulsePhase += 0.05;
          const scale = 1 + Math.sin(marker.userData.pulsePhase) * 0.3;
          marker.scale.set(scale, scale, scale);
        }
      });


      
      // Rotate starfield slowly for depth
      if (stars) {
        stars.rotation.y += 0.0001;
      }

      // Hover detection for users, disasters, weather
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      // Check disaster markers first
      const disasterIntersects = raycasterRef.current.intersectObjects(disasterMarkersRef.current);
      if (disasterIntersects.length > 0 && disasterIntersects[0].object.userData.isDisaster) {
        setHoveredDisaster(disasterIntersects[0].object.userData.disaster);
        setHoveredMarker(null);
        canvasRef.current.style.cursor = 'pointer';
      } else {
        setHoveredDisaster(null);
        
        // Check user markers
        const userIntersects = raycasterRef.current.intersectObjects(markers);
        
        // Reset all markers to normal
        markers.forEach(marker => {
          if (marker !== hoveredMarker) {
            marker.scale.set(1, 1, 1);
          }
        });

        if (userIntersects.length > 0) {
          const newHover = userIntersects[0].object;
          if (newHover.userData.isMarker) {
            newHover.scale.set(1.5, 1.5, 1.5);
            setHoveredMarker(newHover);
            canvasRef.current.style.cursor = 'pointer';
          }
        } else {
          setHoveredMarker(null);
          canvasRef.current.style.cursor = 'grab';
        }
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
      if (countryBorders) {
        countryBorders.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      }
      if (clouds) {
        clouds.geometry.dispose();
        clouds.material.dispose();
      }
      atmosphereGeometry1.dispose();
      atmosphereMaterial1.dispose();
      atmosphereGeometry2.dispose();
      atmosphereMaterial2.dispose();
      terminatorGeometry.dispose();
      terminatorMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      markerGeometry.dispose();
      markerMaterialFree.dispose();
      markerMaterialHovered.dispose();
      markerMaterialPro.dispose();
      markers.forEach(m => m.geometry?.dispose());
      labelsRef.current.forEach(label => {
        label.material.map?.dispose();
        label.material.dispose();
      });
      disasterMarkersRef.current.forEach(marker => {
        marker.geometry?.dispose();
        marker.material?.dispose();
      });
      weatherMarkersRef.current.forEach(marker => {
        marker.geometry?.dispose();
        marker.material?.dispose();
      });
      windParticlesRef.current.forEach(particle => {
        particle.geometry?.dispose();
        particle.material?.dispose();
      });
      aqiMarkersRef.current.forEach(marker => {
        marker.geometry?.dispose();
        marker.material?.dispose();
      });
      if (issMarkerRef.current) {
        issMarkerRef.current.geometry?.dispose();
        issMarkerRef.current.material?.dispose();
      }
      if (issOrbitRef.current) {
        issOrbitRef.current.geometry?.dispose();
        issOrbitRef.current.material?.dispose();
      }
      heatmapRef.current.forEach(marker => {
        marker.geometry?.dispose();
        marker.material?.dispose();
      });
      stormMarkersRef.current.forEach(marker => {
        marker.geometry?.dispose();
        marker.material?.dispose();
      });
      controls.dispose();
      renderer.dispose();
      setGlobe(null);
    };
  }, [users.length]);

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
            {/* Search Location */}
            <input
              type="text"
              placeholder="🔍 Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  const allLocations = labelsRef.current;
                  const found = allLocations.find(l => 
                    l.userData.text?.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  if (found && cameraRef.current && controlsRef.current) {
                    const targetPos = found.position.clone();
                    const distance = 2.2;
                    const direction = targetPos.clone().normalize().multiplyScalar(distance);
                    
                    const startPos = cameraRef.current.position.clone();
                    const startTime = Date.now();
                    const duration = 1500;
                    
                    const flyTo = () => {
                      const elapsed = Date.now() - startTime;
                      const progress = Math.min(elapsed / duration, 1);
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
                onClick={() => setGlobeStyle('matrix')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                  globeStyle === 'matrix'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-emerald-500">💎</span> Matrix
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
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (cameraRef.current && controlsRef.current) {
                  cameraRef.current.position.set(0, 0, 3.2);
                  controlsRef.current.target.set(0, 0, 0);
                  controlsRef.current.update();
                }
              }}
            >
              Reset View
            </Button>
          </div>

          {/* Layer Toggles */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Layers:</span>
            <Button
              size="sm"
              variant={activeLayers.users ? "default" : "outline"}
              onClick={() => setActiveLayers(prev => ({ ...prev, users: !prev.users }))}
              className="h-7 text-xs"
            >
              Users
            </Button>
            <Button
              size="sm"
              variant={activeLayers.disasters ? "default" : "outline"}
              onClick={() => setActiveLayers(prev => ({ ...prev, disasters: !prev.disasters }))}
              className="h-7 text-xs"
            >
              Disasters
            </Button>
            <Button
              size="sm"
              variant={activeLayers.weather ? "default" : "outline"}
              onClick={() => setActiveLayers(prev => ({ ...prev, weather: !prev.weather }))}
              className="h-7 text-xs"
            >
              Weather
            </Button>
            <Button
              size="sm"
              variant={showWindLayer ? "default" : "outline"}
              onClick={() => setShowWindLayer(!showWindLayer)}
              className="h-7 text-xs"
            >
              💨 Wind
            </Button>
            <Button
              size="sm"
              variant={showTempLayer ? "default" : "outline"}
              onClick={() => setShowTempLayer(!showTempLayer)}
              className="h-7 text-xs"
            >
              🌡️ Temperature
            </Button>
            <Button
              size="sm"
              variant={issPosition ? "default" : "outline"}
              className="h-7 text-xs"
            >
              🛰️ ISS
            </Button>
            <Button
              size="sm"
              variant={aqiData.length > 0 ? "default" : "outline"}
              className="h-7 text-xs"
            >
              💨 AQI
            </Button>
            <Button
              size="sm"
              variant={showPressureLayer ? "default" : "outline"}
              onClick={() => setShowPressureLayer(!showPressureLayer)}
              className="h-7 text-xs"
            >
              🌀 Pressure
            </Button>
            <Button
              size="sm"
              variant={showStormTracks ? "default" : "outline"}
              onClick={() => setShowStormTracks(!showStormTracks)}
              className="h-7 text-xs"
            >
              🌪️ Storms
            </Button>
            <Button
              size="sm"
              variant={userActivityHeatmap.length > 0 ? "default" : "outline"}
              className="h-7 text-xs"
            >
              🔥 User Activity
            </Button>
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

          {/* Mobile Zoom Controls */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 lg:hidden">
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700"
              onClick={() => {
                if (cameraRef.current && sceneRef.current) {
                  const camera = cameraRef.current;
                  const scene = sceneRef.current;
                  const distance = camera.position.distanceTo(scene.position);
                  const newDistance = Math.max(1.8, distance - 0.3);
                  const direction = camera.position.clone().normalize();
                  camera.position.copy(direction.multiplyScalar(newDistance));
                }
              }}
            >
              <span className="text-white text-xl font-bold">+</span>
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700"
              onClick={() => {
                if (cameraRef.current && sceneRef.current) {
                  const camera = cameraRef.current;
                  const scene = sceneRef.current;
                  const distance = camera.position.distanceTo(scene.position);
                  const newDistance = Math.min(5, distance + 0.3);
                  const direction = camera.position.clone().normalize();
                  camera.position.copy(direction.multiplyScalar(newDistance));
                }
              }}
            >
              <span className="text-white text-xl font-bold">−</span>
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700"
              onClick={() => {
                if (cameraRef.current) {
                  cameraRef.current.position.set(0, 0, 3.2);
                  if (controlsRef.current) {
                    controlsRef.current.target.set(0, 0, 0);
                    controlsRef.current.update();
                  }
                }
              }}
            >
              <span className="text-white text-sm">↺</span>
            </Button>
          </div>
          
          {/* User hover tooltip */}
          {hoveredMarker && !hoveredDisaster && (
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

          {/* Disaster hover tooltip */}
          {hoveredDisaster && (
            <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl pointer-events-none z-10 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${
                  hoveredDisaster.type === 'earthquake' ? 'bg-red-500' :
                  hoveredDisaster.type === 'volcano' ? 'bg-orange-500' :
                  hoveredDisaster.type === 'hurricane' ? 'bg-blue-400' :
                  hoveredDisaster.type === 'tsunami' ? 'bg-blue-600' :
                  hoveredDisaster.type === 'tornado' ? 'bg-purple-500' :
                  'bg-slate-300'
                } animate-pulse`}></div>
                <p className="text-sm font-bold text-white capitalize">{hoveredDisaster.type}</p>
              </div>
              <p className="text-xs text-slate-300">{hoveredDisaster.place || 'Unknown Location'}</p>
              {hoveredDisaster.magnitude && (
                <p className="text-xs text-amber-400 mt-1">Magnitude: {hoveredDisaster.magnitude}</p>
              )}
              {hoveredDisaster.category && (
                <p className="text-xs text-amber-400 mt-1">{hoveredDisaster.category}</p>
              )}
              {hoveredDisaster.time && (
                <p className="text-[10px] text-slate-500 mt-1.5">
                  {new Date(hoveredDisaster.time).toLocaleDateString()}
                </p>
              )}
              <p className="text-[10px] text-slate-500 mt-2">Click for details</p>
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 sm:px-4 hidden sm:block">
            <p className="text-[10px] sm:text-xs text-slate-300 text-center whitespace-nowrap">
              🖱️ Drag to rotate • 🔍 Scroll to zoom • 👆 Click markers/locations for details • 🌍 Explore the world
            </p>
          </div>

          {/* Mobile instruction */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 sm:hidden">
            <p className="text-[10px] text-slate-300 text-center">
              👆 Drag & pinch • Tap markers for details
            </p>
          </div>

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-2 sm:p-3 space-y-1 sm:space-y-1.5 shadow-xl max-h-[80%] overflow-y-auto">
            {activeLayers.users && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50"></div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50"></div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Pro</span>
                </div>
              </>
            )}
            {activeLayers.disasters && disasters.length > 0 && (
              <>
                <div className="border-t border-slate-700 pt-1.5"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50"></div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Earthquake</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shadow-lg shadow-orange-500/50"></div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Volcano</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50"></div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Hurricane</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-lg shadow-blue-600/50"></div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Tsunami</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shadow-lg shadow-purple-500/50"></div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Tornado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-pulse shadow-lg shadow-slate-300/50"></div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Blizzard</span>
                </div>
              </>
            )}
            {activeLayers.weather && weatherData.length > 0 && (
              <>
                <div className="border-t border-slate-700 pt-1.5"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"></div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Rain</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50"></div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Clear</span>
                </div>
              </>
            )}
            {issPosition && (
              <>
                <div className="border-t border-slate-700 pt-1.5"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50"></div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">ISS</span>
                </div>
              </>
            )}
            {aqiData.length > 0 && (
              <>
                <div className="border-t border-slate-700 pt-1.5"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-lg"></div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">AQI Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg"></div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">AQI Poor</span>
                </div>
              </>
            )}
            {showTempLayer && (
              <>
                <div className="border-t border-slate-700 pt-1.5"></div>
                <div className="text-[10px] sm:text-xs text-slate-300 font-medium mb-1">Temperature</div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                </div>
                <span className="text-[9px] text-slate-400">Cold → Hot</span>
              </>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3 space-y-1">
          <span className="block">🌍 200+ countries • 250+ states/provinces • ⭐ All capital cities marked with gold stars</span>
          <span className="block">📍 Live ISS orbit • Natural disasters • Weather stations • Air quality • Wind flow • Temperature zones • Pressure systems • Storm tracking</span>
          <span className="block">🔍 Search any location • Real UTC day/night cycle • User activity heatmap • Interactive layers</span>
        </p>
      </Card>

      {/* Selected Location Detail Panel */}
      {selectedLocation && (
        <Card className="p-4 sm:p-6 border-2 border-blue-500 dark:border-blue-600 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              {selectedLocation.type === 'disaster' && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-4 h-4 rounded-full ${
                      selectedLocation.data.type === 'earthquake' ? 'bg-red-500' :
                      selectedLocation.data.type === 'volcano' ? 'bg-orange-500' :
                      selectedLocation.data.type === 'hurricane' ? 'bg-blue-400' :
                      selectedLocation.data.type === 'tsunami' ? 'bg-blue-600' :
                      selectedLocation.data.type === 'tornado' ? 'bg-purple-500' :
                      'bg-slate-300'
                    } animate-pulse shadow-lg`}></div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white capitalize">{selectedLocation.data.type}</h3>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{selectedLocation.data.place || 'Unknown Location'}</p>
                  {selectedLocation.data.magnitude && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">Magnitude: <span className="font-bold">{selectedLocation.data.magnitude}</span></p>
                  )}
                  {selectedLocation.data.category && (
                    <p className="text-sm text-blue-600 dark:text-blue-400">Category: <span className="font-bold">{selectedLocation.data.category}</span></p>
                  )}
                  {selectedLocation.data.time && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {new Date(selectedLocation.data.time).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    📍 {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lon.toFixed(4)}°
                  </p>
                </>
              )}

              {selectedLocation.type === 'weather' && (
                <>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">{selectedLocation.data.name}</h3>
                  <div className="space-y-1">
                    {selectedLocation.data.temp !== undefined && (
                      <p className="text-sm text-slate-700 dark:text-slate-300">🌡️ Temperature: <span className="font-semibold">{selectedLocation.data.temp}°C</span></p>
                    )}
                    {selectedLocation.data.precipitation !== undefined && (
                      <p className="text-sm text-slate-700 dark:text-slate-300">🌧️ Precipitation: <span className="font-semibold">{selectedLocation.data.precipitation} mm</span></p>
                    )}
                    {selectedLocation.data.clouds !== undefined && (
                      <p className="text-sm text-slate-700 dark:text-slate-300">☁️ Cloud Cover: <span className="font-semibold">{selectedLocation.data.clouds}%</span></p>
                    )}
                    {selectedLocation.data.windSpeed !== undefined && (
                      <p className="text-sm text-slate-700 dark:text-slate-300">💨 Wind Speed: <span className="font-semibold">{selectedLocation.data.windSpeed} km/h</span></p>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    📍 {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lon.toFixed(4)}°
                  </p>
                </>
              )}

              {selectedLocation.type === 'location' && (
                <>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">{selectedLocation.data.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    📍 {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lon.toFixed(4)}°
                  </p>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedLocation(null)}
              className="h-8 w-8 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

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