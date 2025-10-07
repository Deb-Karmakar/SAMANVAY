// src/pages/state/MapPage.jsx (Combined Version with Heatmap and Enhanced Features)

import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance, useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import { Map as MapIcon, Loader2, AlertTriangle, Info } from "lucide-react";
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

// State configuration for centers and GeoJSON file paths
const stateGeoConfig = {
  'Andaman and Nicobar Islands': {
    file: '/assets/IndiaStateTopojsonFiles/Andaman.geojson',
    center: [11.7401, 92.6586],
    zoom: 7
  },
  'Andhra Pradesh': {
    file: '/assets/IndiaStateTopojsonFiles/AndhraPradesh.geojson',
    center: [15.9129, 79.7400],
    zoom: 6
  },
  'Arunachal Pradesh': {
    file: '/assets/IndiaStateTopojsonFiles/ArunachalPradesh.geojson',
    center: [28.2180, 94.7278],
    zoom: 6
  },
  'Assam': {
    file: '/assets/IndiaStateTopojsonFiles/Assam.geojson',
    center: [26.2006, 92.9376],
    zoom: 6
  },
  'Bihar': {
    file: '/assets/IndiaStateTopojsonFiles/Bihar.geojson',
    center: [25.0961, 85.3131],
    zoom: 7
  },
  'Chandigarh': {
    file: '/assets/IndiaStateTopojsonFiles/Chandigarh.geojson',
    center: [30.7333, 76.7794],
    zoom: 9
  },
  'Chhattisgarh': {
    file: '/assets/IndiaStateTopojsonFiles/Chhattisgarh.geojson',
    center: [21.2787, 81.8661],
    zoom: 6
  },
  'Dadra and Nagar Haveli and Daman and Diu': {
    file: '/assets/IndiaStateTopojsonFiles/DadraAndNagarHaveliAndDamanAndDiu.geojson',
    center: [20.1809, 73.0169],
    zoom: 8
  },
  'Delhi': {
    file: '/assets/IndiaStateTopojsonFiles/Delhi.geojson',
    center: [28.7041, 77.1025],
    zoom: 9
  },
  'Goa': {
    file: '/assets/IndiaStateTopojsonFiles/Goa.geojson',
    center: [15.2993, 74.1240],
    zoom: 8
  },
  'Gujarat': {
    file: '/assets/IndiaStateTopojsonFiles/Gujarat.geojson',
    center: [22.2587, 71.1924],
    zoom: 6
  },
  'Haryana': {
    file: '/assets/IndiaStateTopojsonFiles/Haryana.geojson',
    center: [29.0588, 76.0856],
    zoom: 7
  },
  'Himachal Pradesh': {
    file: '/assets/IndiaStateTopojsonFiles/HimachalPradesh.geojson',
    center: [31.1048, 77.1734],
    zoom: 7
  },
  'Jammu and Kashmir': {
    file: '/assets/IndiaStateTopojsonFiles/JammuAndKashmir.geojson',
    center: [33.7782, 76.5762],
    zoom: 6
  },
  'Jharkhand': {
    file: '/assets/IndiaStateTopojsonFiles/Jharkhand.geojson',
    center: [23.6102, 85.2799],
    zoom: 7
  },
  'Karnataka': {
    file: '/assets/IndiaStateTopojsonFiles/Karnataka.geojson',
    center: [15.3173, 75.7139],
    zoom: 6
  },
  'Kerala': {
    file: '/assets/IndiaStateTopojsonFiles/Kerala.geojson',
    center: [10.8505, 76.2711],
    zoom: 7
  },
  'Ladakh': {
    file: '/assets/IndiaStateTopojsonFiles/Ladakh.geojson',
    center: [34.1526, 77.5770],
    zoom: 6
  },
  'Lakshadweep': {
    file: '/assets/IndiaStateTopojsonFiles/Lakshadweep.geojson',
    center: [10.5667, 72.6417],
    zoom: 8
  },
  'Madhya Pradesh': {
    file: '/assets/IndiaStateTopojsonFiles/MadhyaPradesh.geojson',
    center: [23.4733, 77.9470],
    zoom: 6
  },
  'Maharashtra': {
    file: '/assets/IndiaStateTopojsonFiles/Maharashtra.geojson',
    center: [19.7515, 75.7139],
    zoom: 6
  },
  'Manipur': {
    file: '/assets/IndiaStateTopojsonFiles/Manipur.geojson',
    center: [24.6637, 93.9063],
    zoom: 7
  },
  'Meghalaya': {
    file: '/assets/IndiaStateTopojsonFiles/Meghalaya.geojson',
    center: [25.4670, 91.3662],
    zoom: 7
  },
  'Mizoram': {
    file: '/assets/IndiaStateTopojsonFiles/Mizoram.geojson',
    center: [23.1645, 92.9376],
    zoom: 7
  },
  'Nagaland': {
    file: '/assets/IndiaStateTopojsonFiles/Nagaland.geojson',
    center: [26.1584, 94.5624],
    zoom: 7
  },
  'Odisha': {
    file: '/assets/IndiaStateTopojsonFiles/Odisha.geojson',
    center: [20.9517, 85.0985],
    zoom: 6
  },
  'Puducherry': {
    file: '/assets/IndiaStateTopojsonFiles/Puducherry.geojson',
    center: [11.9416, 79.8083],
    zoom: 8
  },
  'Punjab': {
    file: '/assets/IndiaStateTopojsonFiles/Punjab.geojson',
    center: [31.1471, 75.3412],
    zoom: 7
  },
  'Rajasthan': {
    file: '/assets/IndiaStateTopojsonFiles/Rajasthan.geojson',
    center: [27.0238, 74.2179],
    zoom: 6
  },
  'Sikkim': {
    file: '/assets/IndiaStateTopojsonFiles/Sikkim.geojson',
    center: [27.5330, 88.5122],
    zoom: 8
  },
  'Tamil Nadu': {
    file: '/assets/IndiaStateTopojsonFiles/TamilNadu.geojson',
    center: [11.1271, 78.6569],
    zoom: 6
  },
  'Telangana': {
    file: '/assets/IndiaStateTopojsonFiles/Telangana.geojson',
    center: [18.1124, 79.0193],
    zoom: 6
  },
  'Tripura': {
    file: '/assets/IndiaStateTopojsonFiles/Tripura.geojson',
    center: [23.9408, 91.9882],
    zoom: 7
  },
  'Uttar Pradesh': {
    file: '/assets/IndiaStateTopojsonFiles/UttarPradesh.geojson',
    center: [26.8467, 80.9462],
    zoom: 6
  },
  'Uttarakhand': {
    file: '/assets/IndiaStateTopojsonFiles/Uttarakhand.geojson',
    center: [30.0668, 79.0193],
    zoom: 7
  },
  'West Bengal': {
    file: '/assets/IndiaStateTopojsonFiles/WestBengal.geojson',
    center: [24.0, 87.9],
    zoom: 6
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
      
      // Count by status
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
      <div style="min-width: 200px;">
        <div class="font-bold text-base" style="margin-bottom: 8px;">${districtName}</div>
        <div style="margin-bottom: 4px;"><strong>Total Projects:</strong> ${districtData.count}</div>
        <div style="color: ${STATUS_COLORS[PROJECT_STATUS.ON_TRACK]};"><strong>On Track:</strong> ${districtData.onTrack}</div>
        <div style="color: ${STATUS_COLORS[PROJECT_STATUS.DELAYED]};"><strong>Delayed:</strong> ${districtData.delayed}</div>
        <div style="color: ${STATUS_COLORS[PROJECT_STATUS.COMPLETED]};"><strong>Completed:</strong> ${districtData.completed}</div>
        <div style="color: ${STATUS_COLORS[PROJECT_STATUS.PENDING]};"><strong>Pending:</strong> ${districtData.pending}</div>
      </div>
    `;
    
    layer.bindPopup(popupContent);
    
    layer.on({
      click: (event) => {
        // Only zoom to district if not in heatmap mode
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

// Legend Component
function MapLegend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <span className="text-sm">{status}</span>
          </div>
        ))}
        <div className="pt-2 mt-2 border-t">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Click districts to zoom
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Filters Component
function MapFilters({ filters, setFilters, districts }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search" className="sr-only">Search</Label>
          <Input 
            id="search"
            placeholder="Search project name..." 
            value={filters.search} 
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))} 
          />
        </div>
        
        <div>
          <Label className="font-semibold mb-2 block">Status</Label>
          {Object.values(PROJECT_STATUS).map(status => (
            <div key={status} className="flex items-center space-x-2 mt-2">
              <Checkbox 
                id={status} 
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
                htmlFor={status} 
                className="font-normal cursor-pointer"
              >
                {status}
              </Label>
            </div>
          ))}
        </div>
        
        <div>
          <Label htmlFor="district-select" className="font-semibold mb-2 block">
            District
          </Label>
          <Select 
            value={filters.district} 
            onValueChange={value => setFilters(prev => ({ ...prev, district: value }))}
          >
            <SelectTrigger id="district-select">
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
      </CardContent>
    </Card>
  );
}

// Map View Controls Component
function MapViewControls({ heatmapVisible, setHeatmapVisible }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Map View</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Label htmlFor="heatmap-toggle" className="font-semibold cursor-pointer">
            Show Heatmap
          </Label>
          <Switch 
            id="heatmap-toggle" 
            checked={heatmapVisible} 
            onCheckedChange={setHeatmapVisible} 
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Visualize project density with higher intensity for delayed projects.
        </p>
      </CardContent>
    </Card>
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
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
      p.location.coordinates[1], // latitude
      p.location.coordinates[0], // longitude
      calculateHeatmapIntensity(p.status)
    ]);
  }, [filteredProjects]);

  // Error states
  if (!stateName) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-red-600">
        <AlertTriangle className="h-8 w-8 mr-2" />
        Error: Could not determine your state.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading Map Data...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-red-600">
        <AlertTriangle className="h-8 w-8 mr-2" />
        Failed to load project data: {error?.message || 'Unknown error'}
      </div>
    );
  }

  const config = stateGeoConfig[stateName] || { center: [22, 82], zoom: 5 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <MapIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{stateName} GIS Map</h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[75vh]">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6 flex flex-col overflow-y-auto">
          <MapFilters 
            filters={filters} 
            setFilters={setFilters} 
            districts={districts} 
          />
          
          <MapViewControls 
            heatmapVisible={heatmapVisible} 
            setHeatmapVisible={setHeatmapVisible} 
          />
          
          <MapLegend />
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3 h-full">
          <Card className="h-full relative">
            {geoError && (
              <div className="absolute text-sm top-4 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg z-[1000] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {geoError}
              </div>
            )}
            
            <MapContainer 
              key={`${stateName}-${heatmapVisible}`} 
              center={config.center} 
              zoom={config.zoom} 
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
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' 
              />
              
              {geoData && (
                <DistrictJsonLayer 
                  projects={projects || []} 
                  geoData={geoData} 
                  heatmapVisible={heatmapVisible}
                />
              )}
              
              {/* Conditional rendering: Heatmap or Markers */}
              {heatmapVisible ? (
                <HeatmapLayer
                  points={heatmapPoints}
                  longitudeExtractor={m => m[1]}
                  latitudeExtractor={m => m[0]}
                  intensityExtractor={m => m[2]}
                  radius={HEATMAP_CONFIG.radius}
                  blur={HEATMAP_CONFIG.blur}
                  max={1.0}
                  gradient={HEATMAP_CONFIG.gradient}
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
    </div>
  );
}