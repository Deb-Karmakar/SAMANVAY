import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { Map, Loader2 } from "lucide-react";
import L from 'leaflet';

// Mock Data
const stateName = "Rajasthan";
const stateCenter = [26.8, 74.2];
const mockStateProjects = [
  { id: 1, name: 'Adarsh Gram - Jaipur', district: 'Jaipur', position: [26.9124, 75.7873], status: 'On Track', agency: 'Rajasthan PWD' },
  { id: 2, name: 'Hostel Construction - Jodhpur', district: 'Jodhpur', position: [26.2389, 73.0243], status: 'Delayed', agency: 'Jodhpur Municipal Corp' },
  { id: 3, name: 'GIA Skill Center - Udaipur', district: 'Udaipur', position: [24.5854, 73.7125], status: 'Completed', agency: 'Udaipur Skill Dev' },
  { id: 4, name: 'Hostel Upgrade - Ajmer', district: 'Ajmer', position: [26.4499, 74.6399], status: 'On Track', agency: 'Rajasthan PWD' },
  { id: 5, name: 'Adarsh Gram - Kota', district: 'Kota', position: [25.2138, 75.8648], status: 'Delayed', agency: 'Kota Rural Dept' },
];
const mockDistricts = ['Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer', 'Kota'];
const mockAgencies = ['Rajasthan PWD', 'Jodhpur Municipal Corp', 'Udaipur Skill Dev', 'Kota Rural Dept'];

// State configurations - map your files to state names
// Try multiple possible path variations
const stateConfigs = {
  'Rajasthan': { file: '/assets/IndiaStateTopojsonFiles/Rajasthan.geojson', center: [26.8, 74.2], zoom: 7 },
  'Andaman': { file: '/assets/IndiaStateTopojsonFiles/Andaman.geojson', center: [11.7, 92.7], zoom: 7 },
  'AndhraPradesh': { file: '/assets/IndiaStateTopojsonFiles/AndhraPradesh.geojson', center: [15.9, 79.7], zoom: 7 },
  'Arunachal': { file: '/assets/IndiaStateTopojsonFiles/Arunachal.geojson', center: [28.2, 94.7], zoom: 7 },
  'Assam': { file: '/assets/IndiaStateTopojsonFiles/Assam.geojson', center: [26.2, 92.9], zoom: 7 },
  'Bihar': { file: '/assets/IndiaStateTopojsonFiles/Bihar.geojson', center: [25.4, 85.3], zoom: 7 },
  'Chandigarh': { file: '/assets/IndiaStateTopojsonFiles/Chandigarh.geojson', center: [30.7, 76.8], zoom: 11 },
  'Chhattisgarh': { file: '/assets/IndiaStateTopojsonFiles/Chhattisgarh.geojson', center: [21.3, 81.9], zoom: 7 },
  'Dadra': { file: '/assets/IndiaStateTopojsonFiles/Dadra.geojson', center: [20.2, 73.0], zoom: 10 },
  'Daman': { file: '/assets/IndiaStateTopojsonFiles/Daman.geojson', center: [20.4, 72.8], zoom: 11 },
  'Delhi': { file: '/assets/IndiaStateTopojsonFiles/Delhi.geojson', center: [28.7, 77.1], zoom: 10 },
  'Goa': { file: '/assets/IndiaStateTopojsonFiles/Goa.geojson', center: [15.3, 74.0], zoom: 9 },
  'Gujrat': { file: '/assets/IndiaStateTopojsonFiles/Gujrat.geojson', center: [22.3, 71.5], zoom: 7 },
  'Haryana': { file: '/assets/IndiaStateTopojsonFiles/Haryana.geojson', center: [29.1, 76.0], zoom: 8 },
};

const getIcon = (status) => {
  const color = status === 'On Track' ? '#22c55e' : status === 'Delayed' ? '#ef4444' : '#3b82f6';
  const html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
  return L.divIcon({ html: html, className: 'dummy', iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24] });
};

export default function StateMap() {
  const [filters, setFilters] = useState({ 
    status: ['On Track', 'Delayed', 'Completed'], 
    district: 'all', 
    agency: 'all', 
    search: '' 
  });
  const [selectedState, setSelectedState] = useState('Rajasthan');
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load GeoJSON data when state changes
  useEffect(() => {
    const loadGeoData = async () => {
      const config = stateConfigs[selectedState];
      if (!config) return;

      setLoading(true);
      setError(null);
      
      try {
        // Try multiple path variations
        const pathVariations = [
          config.file,
          config.file.replace('/assets/', './assets/'),
          config.file.replace('/assets/', 'assets/'),
          config.file.replace('/assets/', '../assets/'),
        ];

        let data = null;
        let lastError = null;

        for (const path of pathVariations) {
          try {
            console.log('Trying path:', path);
            const response = await fetch(path);
            
            // Check if response is HTML (error page)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
              console.log('Received HTML instead of JSON for path:', path);
              continue;
            }
            
            if (!response.ok) {
              console.log('Response not OK for path:', path, response.status);
              continue;
            }
            
            data = await response.json();
            console.log('Successfully loaded from:', path);
            break;
          } catch (err) {
            lastError = err;
            console.log('Failed to load from:', path, err.message);
          }
        }

        if (!data) {
          throw new Error(`Could not load GeoJSON. Please check file paths. Last error: ${lastError?.message || 'Unknown'}`);
        }

        setGeoData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error loading GeoJSON:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGeoData();
  }, [selectedState]);

  const handleStatusChange = (status, checked) => {
    setFilters(prev => ({ 
      ...prev, 
      status: checked ? [...prev.status, status] : prev.status.filter(s => s !== status) 
    }));
  };

  const filteredProjects = useMemo(() => {
    return mockStateProjects.filter(p => 
      filters.status.includes(p.status) &&
      (filters.district === 'all' || p.district === filters.district) &&
      (filters.agency === 'all' || p.agency === filters.agency) &&
      (p.name.toLowerCase().includes(filters.search.toLowerCase()))
    );
  }, [filters]);

  const geoJsonStyle = {
    fillColor: '#3b82f6',
    fillOpacity: 0.1,
    color: '#2563eb',
    weight: 2,
  };

  const config = stateConfigs[selectedState] || { center: stateCenter, zoom: 7 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Map className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">State Map View</h1>
        </div>
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(stateConfigs).map(state => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Search project name..." 
                value={filters.search} 
                onChange={e => setFilters({...filters, search: e.target.value})} 
              />
              
              <div>
                <Label className="mb-2 block">Status</Label>
                {['On Track', 'Delayed', 'Completed'].map(status => (
                  <div key={status} className="flex items-center space-x-2 mt-2">
                    <Checkbox 
                      id={status} 
                      checked={filters.status.includes(status)} 
                      onCheckedChange={(checked) => handleStatusChange(status, checked)} 
                    />
                    <Label htmlFor={status} className="font-normal cursor-pointer">{status}</Label>
                  </div>
                ))}
              </div>
              
              <div>
                <Label>District</Label>
                <Select value={filters.district} onValueChange={value => setFilters({...filters, district: value})}>
                  <SelectTrigger><SelectValue placeholder="All Districts" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {mockDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Executing Agency</Label>
                <Select value={filters.agency} onValueChange={value => setFilters({...filters, agency: value})}>
                  <SelectTrigger><SelectValue placeholder="All Agencies" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agencies</SelectItem>
                    {mockAgencies.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Legend</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm">On Track</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm">Delayed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <div className="w-4 h-4 border-2 border-blue-600 bg-blue-100"></div>
                <span className="text-sm">State Boundary</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 h-[60vh] md:h-[75vh]">
          <Card className="h-full relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {error && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 px-4 py-2 rounded-lg z-10">
                {error}
              </div>
            )}
            <MapContainer 
              key={selectedState}
              center={config.center} 
              zoom={config.zoom} 
              scrollWheelZoom={true} 
              style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            >
              <TileLayer 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
              />
              
              {geoData && (
                <GeoJSON 
                  data={geoData} 
                  style={geoJsonStyle}
                />
              )}
              
              {filteredProjects.map(project => (
                <Marker key={project.id} position={project.position} icon={getIcon(project.status)}>
                  <Popup>
                    <div className="font-semibold">{project.name}</div>
                    <div><strong>Status:</strong> {project.status}</div>
                    <div><strong>District:</strong> {project.district}</div>
                    <div><strong>Agency:</strong> {project.agency}</div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}