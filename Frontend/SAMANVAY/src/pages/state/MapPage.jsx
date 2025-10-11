// src/pages/state/MapPage.jsx (Mobile Responsive Version)

import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance, useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import { Map as MapIcon, Loader2, AlertTriangle, Info, Filter, Layers } from "lucide-react";
import L from 'leaflet';

// --- Constants and Configuration ---
const PROJECT_STATUS = {
  ON_TRACK: 'On Track',
  DELAYED: 'Delayed',
  COMPLETED: 'Completed',
  PENDING: 'Pending Approval'
};

const STATUS_COLORS = {
  [PROJECT_STATUS.ON_TRACK]: '#22c55e',
  [PROJECT_STATUS.DELAYED]: '#ef4444',
  [PROJECT_STATUS.COMPLETED]: '#3b82f6',
  [PROJECT_STATUS.PENDING]: '#f59e0b'
};

const HEATMAP_CONFIG = {
  radius: 25,
  blur: 20,
  maxZoom: 17,
  gradient: {
    0.0: 'blue',
    0.5: 'lime',
    0.7: 'yellow',
    1.0: 'red'
  }
};

// Mobile heatmap config with smaller radius
const MOBILE_HEATMAP_CONFIG = {
  ...HEATMAP_CONFIG,
  radius: 20,
  blur: 15,
};

// State configuration for centers and GeoJSON file paths
const stateGeoConfig = {
  'Andaman and Nicobar Islands': {
    file: '/IndiaStateTopojsonFiles/Andaman.geojson',
    center: [11.7401, 92.6586],
    zoom: 7,
    mobileZoom: 6
  },
  'Andhra Pradesh': {
    file: '/IndiaStateTopojsonFiles/AndhraPradesh.geojson',
    center: [15.9129, 79.7400],
    zoom: 6,
    mobileZoom: 5
  },
  'Arunachal Pradesh': {
    file: '/IndiaStateTopojsonFiles/Arunachal.geojson',
    center: [28.2180, 94.7278],
    zoom: 6,
    mobileZoom: 5
  },
  'Assam': {
    file: '/IndiaStateTopojsonFiles/Assam.geojson',
    center: [26.2006, 92.9376],
    zoom: 6,
    mobileZoom: 5
  },
  'Bihar': {
    file: '/IndiaStateTopojsonFiles/Bihar.geojson',
    center: [25.0961, 85.3131],
    zoom: 7,
    mobileZoom: 6
  },
  'Chandigarh': {
    file: '/IndiaStateTopojsonFiles/Chandigarh.geojson',
    center: [30.7333, 76.7794],
    zoom: 9,
    mobileZoom: 8
  },
  'Chhattisgarh': {
    file: '/IndiaStateTopojsonFiles/Chhattisgarh.geojson',
    center: [21.2787, 81.8661],
    zoom: 6,
    mobileZoom: 5
  },
  'Dadra and Nagar Haveli and Daman and Diu': {
    file: '/IndiaStateTopojsonFiles/Dadra.geojson',
    center: [20.1809, 73.0169],
    zoom: 8,
    mobileZoom: 7
  },
  'Delhi': {
    file: '/IndiaStateTopojsonFiles/Delhi.geojson',
    center: [28.7041, 77.1025],
    zoom: 9,
    mobileZoom: 8
  },
  'Goa': {
    file: '/IndiaStateTopojsonFiles/Goa.geojson',
    center: [15.2993, 74.1240],
    zoom: 8,
    mobileZoom: 7
  },
  'Gujarat': {
    file: '/IndiaStateTopojsonFiles/Gujrat.geojson',
    center: [22.2587, 71.1924],
    zoom: 6,
    mobileZoom: 5
  },
  'Haryana': {
    file: '/IndiaStateTopojsonFiles/Haryana.geojson',
    center: [29.0588, 76.0856],
    zoom: 7,
    mobileZoom: 6
  },
  'Himachal Pradesh': {
    file: '/IndiaStateTopojsonFiles/Himanchal.geojson',
    center: [31.1048, 77.1734],
    zoom: 7,
    mobileZoom: 6
  },
  'Jammu and Kashmir': {
    file: '/IndiaStateTopojsonFiles/JammuAndKashmir.geojson',
    center: [33.7782, 76.5762],
    zoom: 6,
    mobileZoom: 5
  },
  'Jharkhand': {
    file: '/IndiaStateTopojsonFiles/Jharkhand.geojson',
    center: [23.6102, 85.2799],
    zoom: 7,
    mobileZoom: 6
  },
  'Karnataka': {
    file: '/IndiaStateTopojsonFiles/Karnataka.geojson',
    center: [15.3173, 75.7139],
    zoom: 6,
    mobileZoom: 5
  },
  'Kerala': {
    file: '/IndiaStateTopojsonFiles/Kerala.geojson',
    center: [10.8505, 76.2711],
    zoom: 7,
    mobileZoom: 6
  },
  'Ladakh': {
    file: '/IndiaStateTopojsonFiles/JammuAndKashmir.geojson', // Ladakh file not found, using J&K
    center: [34.1526, 77.5770],
    zoom: 6,
    mobileZoom: 5
  },
  'Lakshadweep': {
    file: '/IndiaStateTopojsonFiles/Lakshadweep.geojson',
    center: [10.5667, 72.6417],
    zoom: 8,
    mobileZoom: 7
  },
  'Madhya Pradesh': {
    file: '/IndiaStateTopojsonFiles/MadhyaPradesh.geojson',
    center: [23.4733, 77.9470],
    zoom: 6,
    mobileZoom: 5
  },
  'Maharashtra': {
    file: '/IndiaStateTopojsonFiles/Maharashtra.geojson',
    center: [19.7515, 75.7139],
    zoom: 6,
    mobileZoom: 5
  },
  'Manipur': {
    file: '/IndiaStateTopojsonFiles/Manipur.geojson',
    center: [24.6637, 93.9063],
    zoom: 7,
    mobileZoom: 6
  },
  'Meghalaya': {
    file: '/IndiaStateTopojsonFiles/Meghalaya.geojson',
    center: [25.4670, 91.3662],
    zoom: 7,
    mobileZoom: 6
  },
  'Mizoram': {
    file: '/IndiaStateTopojsonFiles/Mizoram.geojson',
    center: [23.1645, 92.9376],
    zoom: 7,
    mobileZoom: 6
  },
  'Nagaland': {
    file: '/IndiaStateTopojsonFiles/Nagaland.geojson',
    center: [26.1584, 94.5624],
    zoom: 7,
    mobileZoom: 6
  },
  'Odisha': {
    file: '/IndiaStateTopojsonFiles/Orissa.geojson',
    center: [20.9517, 85.0985],
    zoom: 6,
    mobileZoom: 5
  },
  'Puducherry': {
    file: '/IndiaStateTopojsonFiles/Puducherry.geojson',
    center: [11.9416, 79.8083],
    zoom: 8,
    mobileZoom: 7
  },
  'Punjab': {
    file: '/IndiaStateTopojsonFiles/Punjab.geojson',
    center: [31.1471, 75.3412],
    zoom: 7,
    mobileZoom: 6
  },
  'Rajasthan': {
    file: '/IndiaStateTopojsonFiles/Rajasthan.geojson',
    center: [27.0238, 74.2179],
    zoom: 6,
    mobileZoom: 5
  },
  'Sikkim': {
    file: '/IndiaStateTopojsonFiles/Sikkim.geojson',
    center: [27.5330, 88.5122],
    zoom: 8,
    mobileZoom: 7
  },
  'Tamil Nadu': {
    file: '/IndiaStateTopojsonFiles/TamilNadu.geojson',
    center: [11.1271, 78.6569],
    zoom: 6,
    mobileZoom: 5
  },
  'Telangana': {
    file: '/IndiaStateTopojsonFiles/Telangana.geojson',
    center: [18.1124, 79.0193],
    zoom: 6,
    mobileZoom: 5
  },
  'Tripura': {
    file: '/IndiaStateTopojsonFiles/Tripura.geojson',
    center: [23.9408, 91.9882],
    zoom: 7,
    mobileZoom: 6
  },
  'Uttar Pradesh': {
    file: '/IndiaStateTopojsonFiles/UttarPradesh.geojson',
    center: [26.8467, 80.9462],
    zoom: 6,
    mobileZoom: 5
  },
  'Uttarakhand': {
    file: '/IndiaStateTopojsonFiles/Uttarakhand.geojson',
    center: [30.0668, 79.0193],
    zoom: 7,
    mobileZoom: 6
  },
  'West Bengal': {
    file: '/IndiaStateTopojsonFiles/WestBengal.geojson',
    center: [24.0, 87.9],
    zoom: 6,
    mobileZoom: 5
  }
};

// --- API Functions ---
const fetchStateProjectLocations = async () => {
  const { data } = await axiosInstance.get('/projects/locations/mystate');
  return data;
};

// --- Utility Functions ---
const getIcon = (status) => {
  const color = STATUS_COLORS[status] || STATUS_COLORS[PROJECT_STATUS.PENDING];
  const html = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`;
  
  return L.divIcon({ 
    html, 
    className: 'custom-leaflet-icon', 
    iconSize: [24, 24], 
    iconAnchor: [12, 24], 
    popupAnchor: [0, -24] 
  });
};

const calculateHeatmapIntensity = (status) => {
  switch (status) {
    case PROJECT_STATUS.DELAYED:
      return 1.0;
    case PROJECT_STATUS.ON_TRACK:
      return 0.6;
    case PROJECT_STATUS.COMPLETED:
      return 0.3;
    default:
      return 0.5;
  }
};

// --- Components ---

// GeoJSON Layer for Districts with enhanced interaction
function DistrictJsonLayer({ projects, geoData, heatmapVisible }) {
  const map = useMap();
  const geoJsonLayerRef = useRef(null);
  
  const projectsByDistrict = useMemo(() => {
    if (!projects || !geoData) return {};
    
    return projects.reduce((acc, project) => {
      const districtKey = project.district?.trim();
      if (!districtKey) return acc;
      
      if (!acc[districtKey]) {
        acc[districtKey] = { 
          count: 0, 
          delayed: 0,
          onTrack: 0,
          completed: 0,
          pending: 0
        };
      }
      
      acc[districtKey].count++;
      
      switch (project.status) {
        case PROJECT_STATUS.DELAYED:
          acc[districtKey].delayed++;
          break;
        case PROJECT_STATUS.ON_TRACK:
          acc[districtKey].onTrack++;
          break;
        case PROJECT_STATUS.COMPLETED:
          acc[districtKey].completed++;
          break;
        case PROJECT_STATUS.PENDING:
          acc[districtKey].pending++;
          break;
      }
      
      return acc;
    }, {});
  }, [projects, geoData]);

  const onEachFeature = (feature, layer) => {
    const districtName = feature.properties.DISTRICT || feature.properties.district;
    if (!districtName) return;

    const districtData = projectsByDistrict[districtName.trim()] || { 
      count: 0, 
      delayed: 0, 
      onTrack: 0, 
      completed: 0,
      pending: 0
    };
    
    const popupContent = `
      <div style="min-width: 150px;">
        <div class="font-bold text-base" style="margin-bottom: 8px;">${districtName}</div>
        <div style="margin-bottom: 4px;"><strong>Total:</strong> ${districtData.count}</div>
        <div style="color: ${STATUS_COLORS[PROJECT_STATUS.ON_TRACK]};"><strong>On Track:</strong> ${districtData.onTrack}</div>
        <div style="color: ${STATUS_COLORS[PROJECT_STATUS.DELAYED]};"><strong>Delayed:</strong> ${districtData.delayed}</div>
        <div style="color: ${STATUS_COLORS[PROJECT_STATUS.COMPLETED]};"><strong>Completed:</strong> ${districtData.completed}</div>
        <div style="color: ${STATUS_COLORS[PROJECT_STATUS.PENDING]};"><strong>Pending:</strong> ${districtData.pending}</div>
      </div>
    `;
    
    layer.bindPopup(popupContent);
    
    layer.on({
      click: (event) => {
        if (!heatmapVisible) {
          const bounds = event.target.getBounds();
          map.fitBounds(bounds, { 
            padding: [50, 50],
            maxZoom: 10,
            animate: true,
            duration: 0.5
          });
        }
      },
      mouseover: (event) => {
        event.target.setStyle({ 
          weight: 3, 
          color: '#3b82f6', 
          fillOpacity: 0.3 
        });
        
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          event.target.bringToFront();
        }
      },
      mouseout: (event) => {
        if (geoJsonLayerRef.current) {
          geoJsonLayerRef.current.resetStyle(event.target);
        }
      }
    });
  };

  const geoJsonStyle = {
    fillColor: '#3b82f6',
    fillOpacity: 0.1,
    color: '#2563eb',
    weight: 2,
  };

  return (
    <GeoJSON 
      data={geoData} 
      style={geoJsonStyle} 
      onEachFeature={onEachFeature}
      ref={geoJsonLayerRef}
    />
  );
}

// Filter Panel Component (Reusable for both mobile and desktop)
function FilterPanel({ filters, setFilters, districts }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="font-semibold mb-2 block">Search</Label>
        <Input 
          placeholder="Search project name..." 
          value={filters.search} 
          onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))} 
          className="w-full"
        />
      </div>
      
      <div>
        <Label className="font-semibold mb-2 block">Status</Label>
        <div className="space-y-2">
          {Object.values(PROJECT_STATUS).map(status => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox 
                id={`filter-${status}`} 
                checked={filters.status.includes(status)} 
                onCheckedChange={(checked) => {
                  setFilters(prev => ({ 
                    ...prev, 
                    status: checked 
                      ? [...prev.status, status] 
                      : prev.status.filter(s => s !== status) 
                  }));
                }} 
              />
              <Label 
                htmlFor={`filter-${status}`} 
                className="font-normal cursor-pointer"
              >
                {status}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label className="font-semibold mb-2 block">District</Label>
        <Select 
          value={filters.district} 
          onValueChange={value => setFilters(prev => ({ ...prev, district: value }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {districts.map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Map Controls Component
function MapControls({ heatmapVisible, setHeatmapVisible }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="heatmap-toggle" className="font-semibold">Show Heatmap</Label>
        <Switch 
          id="heatmap-toggle" 
          checked={heatmapVisible} 
          onCheckedChange={setHeatmapVisible} 
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Visualize project density with higher intensity for delayed projects.
      </p>
    </div>
  );
}

// Legend Component
function Legend() {
  return (
    <div className="space-y-2">
      {Object.entries(STATUS_COLORS).map(([status, color]) => (
        <div key={status} className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full flex-shrink-0" 
            style={{ backgroundColor: color }}
          />
          <span className="text-sm">{status}</span>
        </div>
      ))}
      <div className="pt-2 mt-2 border-t">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground">
            Click districts to zoom
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function StateMapPage() {
  const { userInfo } = useAuth();
  const stateName = userInfo?.state;

  // State management
  const [filters, setFilters] = useState({ 
    status: Object.values(PROJECT_STATUS), 
    district: 'all', 
    search: '' 
  });
  const [geoData, setGeoData] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [heatmapVisible, setHeatmapVisible] = useState(false);

  // Detect if mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch project data
  const { 
    data: projects, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['stateProjectLocations', stateName],
    queryFn: fetchStateProjectLocations,
    enabled: !!stateName,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Load GeoJSON data
  useEffect(() => {
    if (!stateName) return;

    const config = stateGeoConfig[stateName];
    if (!config) {
      setGeoError(`Map boundary file not configured for "${stateName}"`);
      return;
    }

    fetch(config.file)
      .then(res => {
        if (!res.ok) throw new Error(`File not found at ${config.file}`);
        return res.json();
      })
      .then(data => {
        setGeoData(data);
        setGeoError(null);
      })
      .catch(err => {
        console.error('Failed to load GeoJSON:', err);
        setGeoError(err.message);
      });
  }, [stateName]);

  // Computed values
  const districts = useMemo(() => {
    if (!projects) return [];
    return [...new Set(projects.map(p => p.district).filter(Boolean))].sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    return projects.filter(p => 
      filters.status.includes(p.status) &&
      (filters.district === 'all' || p.district === filters.district) &&
      (filters.search === '' || 
       p.name.toLowerCase().includes(filters.search.toLowerCase()))
    );
  }, [projects, filters]);

  const heatmapPoints = useMemo(() => {
    if (!filteredProjects) return [];
    
    return filteredProjects.map(p => [
      p.location.coordinates[1],
      p.location.coordinates[0],
      calculateHeatmapIntensity(p.status)
    ]);
  }, [filteredProjects]);

  // Project statistics
  const projectStats = useMemo(() => {
    if (!projects) return { total: 0, onTrack: 0, delayed: 0, completed: 0, pending: 0 };
    return {
      total: projects.length,
      onTrack: projects.filter(p => p.status === PROJECT_STATUS.ON_TRACK).length,
      delayed: projects.filter(p => p.status === PROJECT_STATUS.DELAYED).length,
      completed: projects.filter(p => p.status === PROJECT_STATUS.COMPLETED).length,
      pending: projects.filter(p => p.status === PROJECT_STATUS.PENDING).length,
    };
  }, [projects]);

  // Error states
  if (!stateName) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-red-600 p-4">
        <AlertTriangle className="h-8 w-8 mr-2 flex-shrink-0" />
        <span>Error: Could not determine your state.</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh] p-4">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading Map Data...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-red-600 p-4">
        <AlertTriangle className="h-8 w-8 mr-2 flex-shrink-0" />
        <span className="text-center">Failed to load project data: {error?.message || 'Unknown error'}</span>
      </div>
    );
  }

  const config = stateGeoConfig[stateName] || { center: [22, 82], zoom: 5, mobileZoom: 4 };
  const currentZoom = isMobile ? (config.mobileZoom || config.zoom - 1) : config.zoom;
  const heatmapConfig = isMobile ? MOBILE_HEATMAP_CONFIG : HEATMAP_CONFIG;

  return (
    <div className="w-full">
      <div className="w-full max-w-full overflow-hidden">
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <MapIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold truncate">
                {stateName} GIS Map
              </h1>
            </div>
            
            {/* Mobile Controls */}
            <div className="lg:hidden flex gap-2 flex-shrink-0">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                    <FilterPanel 
                      filters={filters} 
                      setFilters={setFilters} 
                      districts={districts} 
                    />
                  </div>
                </SheetContent>
              </Sheet>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Layers className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <SheetTitle>Map Options</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                    <div>
                      <h3 className="font-semibold mb-3">Map View</h3>
                      <MapControls 
                        heatmapVisible={heatmapVisible} 
                        setHeatmapVisible={setHeatmapVisible} 
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Legend</h3>
                      <Legend />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6 h-[75vh]">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6 flex flex-col overflow-y-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <FilterPanel 
                    filters={filters} 
                    setFilters={setFilters} 
                    districts={districts} 
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Map View</CardTitle>
                </CardHeader>
                <CardContent>
                  <MapControls 
                    heatmapVisible={heatmapVisible} 
                    setHeatmapVisible={setHeatmapVisible} 
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Legend</CardTitle>
                </CardHeader>
                <CardContent>
                  <Legend />
                </CardContent>
              </Card>
            </div>

            {/* Map Container */}
            <div className="lg:col-span-3 h-full">
              <Card className="h-full relative overflow-hidden">
                {geoError && (
                  <div className="absolute text-sm top-4 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg z-[1000] flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {geoError}
                  </div>
                )}
                
                <MapContainer 
                  key={`${stateName}-${heatmapVisible}`} 
                  center={config.center} 
                  zoom={currentZoom} 
                  scrollWheelZoom={true} 
                  style={{ 
                    height: '100%', 
                    width: '100%', 
                    borderRadius: '0.5rem', 
                    backgroundColor: '#f0f0f0' 
                  }}
                >
                  <TileLayer 
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' 
                  />
                  
                  {geoData && (
                    <DistrictJsonLayer 
                      projects={projects || []} 
                      geoData={geoData} 
                      heatmapVisible={heatmapVisible}
                    />
                  )}
                  
                  {heatmapVisible ? (
                    <HeatmapLayer
                      points={heatmapPoints}
                      longitudeExtractor={m => m[1]}
                      latitudeExtractor={m => m[0]}
                      intensityExtractor={m => m[2]}
                      radius={heatmapConfig.radius}
                      blur={heatmapConfig.blur}
                      max={1.0}
                      gradient={heatmapConfig.gradient}
                    />
                  ) : (
                    <MarkerClusterGroup
                      chunkedLoading
                      showCoverageOnHover={false}
                      spiderfyOnMaxZoom={true}
                      disableClusteringAtZoom={14}
                    >
                      {filteredProjects.map(project => (
                        <Marker 
                          key={project._id} 
                          position={[
                            project.location.coordinates[1], 
                            project.location.coordinates[0]
                          ]} 
                          icon={getIcon(project.status)}
                        >
                          <Popup>
                            <div className="min-w-[200px]">
                              <div className="font-semibold text-base mb-2">
                                {project.name}
                              </div>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <strong>District:</strong> {project.district}
                                </div>
                                <div>
                                  <strong>Status:</strong>{' '}
                                  <span style={{ color: STATUS_COLORS[project.status] }}>
                                    {project.status}
                                  </span>
                                </div>
                                <div>
                                  <strong>Progress:</strong> {project.progress}%
                                </div>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MarkerClusterGroup>
                  )}
                </MapContainer>
              </Card>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden -mx-4 sm:mx-0">
            <Tabs defaultValue="map" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mx-4 sm:mx-0" style={{ width: 'calc(100% - 2rem)' }}>
                <TabsTrigger value="map">Map</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="map" className="mt-4 px-4 sm:px-0">
                <Card className="overflow-hidden relative">
                  {geoError && (
                    <div className="absolute text-xs top-2 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-3 py-1 rounded z-[1000] flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">{geoError}</span>
                    </div>
                  )}
                  
                  <div className="relative w-full" style={{ height: 'calc(100vh - 280px)', minHeight: '400px', maxHeight: '600px' }}>
                    <MapContainer 
                      key={`${stateName}-${heatmapVisible}-mobile`} 
                      center={config.center} 
                      zoom={currentZoom} 
                      scrollWheelZoom={true} 
                      style={{ 
                        height: '100%', 
                        width: '100%', 
                        borderRadius: '0.5rem',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: '#f0f0f0'
                      }}
                    >
                      <TileLayer 
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' 
                      />
                      
                      {geoData && (
                        <DistrictJsonLayer 
                          projects={projects || []} 
                          geoData={geoData} 
                          heatmapVisible={heatmapVisible}
                        />
                      )}
                      
                      {heatmapVisible ? (
                        <HeatmapLayer
                          points={heatmapPoints}
                          longitudeExtractor={m => m[1]}
                          latitudeExtractor={m => m[0]}
                          intensityExtractor={m => m[2]}
                          radius={heatmapConfig.radius}
                          blur={heatmapConfig.blur}
                          max={1.0}
                          gradient={heatmapConfig.gradient}
                        />
                      ) : (
                        <MarkerClusterGroup
                          chunkedLoading
                          showCoverageOnHover={false}
                          spiderfyOnMaxZoom={true}
                          disableClusteringAtZoom={14}
                        >
                          {filteredProjects.map(project => (
                            <Marker 
                              key={project._id} 
                              position={[
                                project.location.coordinates[1], 
                                project.location.coordinates[0]
                              ]} 
                              icon={getIcon(project.status)}
                            >
                              <Popup>
                                <div className="text-sm">
                                  <div className="font-semibold mb-1">
                                    {project.name}
                                  </div>
                                  <div className="space-y-0.5 text-xs">
                                    <div>
                                      <strong>District:</strong> {project.district}
                                    </div>
                                    <div>
                                      <strong>Status:</strong>{' '}
                                      <span style={{ color: STATUS_COLORS[project.status] }}>
                                        {project.status}
                                      </span>
                                    </div>
                                    <div>
                                      <strong>Progress:</strong> {project.progress}%
                                    </div>
                                  </div>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        </MarkerClusterGroup>
                      )}
                    </MapContainer>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="info" className="mt-4 space-y-4 px-4 sm:px-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Projects</p>
                        <p className="text-2xl font-bold">{projectStats.total}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Filtered</p>
                        <p className="text-2xl font-bold">{filteredProjects.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">On Track</p>
                        <p className="text-xl font-bold" style={{ color: STATUS_COLORS[PROJECT_STATUS.ON_TRACK] }}>
                          {projectStats.onTrack}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Delayed</p>
                        <p className="text-xl font-bold" style={{ color: STATUS_COLORS[PROJECT_STATUS.DELAYED] }}>
                          {projectStats.delayed}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-xl font-bold" style={{ color: STATUS_COLORS[PROJECT_STATUS.COMPLETED] }}>
                          {projectStats.completed}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-xl font-bold" style={{ color: STATUS_COLORS[PROJECT_STATUS.PENDING] }}>
                          {projectStats.pending}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Districts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {districts.length} districts with projects
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {filters.district !== 'all' && (
                        <p>Currently viewing: <strong>{filters.district}</strong></p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Legend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Legend />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Map Controls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MapControls 
                      heatmapVisible={heatmapVisible} 
                      setHeatmapVisible={setHeatmapVisible} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}