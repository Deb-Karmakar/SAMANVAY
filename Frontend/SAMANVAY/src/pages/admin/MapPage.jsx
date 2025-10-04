import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet'; // 1. Import GeoJSON and useMap
import { Map as MapIcon } from "lucide-react";
import L from 'leaflet';
import statesData from '@/assets/india-states.json'; // 2. Import your GeoJSON data

// --- Mock Project Data ---
const mockProjects = [
  { id: 1, name: 'Adarsh Gram - Jaipur', position: [26.9124, 75.7873], status: 'On Track', component: 'Adarsh Gram', agency: 'Rajasthan PWD' },
  { id: 2, name: 'Hostel Construction - Patna', position: [25.5941, 85.1376], status: 'Delayed', component: 'Hostel', agency: 'Bihar Education Dept.' },
  { id: 3, name: 'GIA Skill Center - Chennai', position: [13.0827, 80.2707], status: 'Completed', component: 'GIA', agency: 'TN Skill Development' },
  { id: 4, name: 'Hostel Upgrade - Lucknow', position: [26.8467, 80.9462], status: 'On Track', component: 'Hostel', agency: 'UP Social Welfare' },
];

// --- Custom Leaflet Icons ---
const getIcon = (status) => {
  const color = status === 'On Track' ? '#22c55e' : status === 'Delayed' ? '#ef4444' : '#3b82f6';
  const html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
  return L.divIcon({ html, className: 'dummy', iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24] });
};

// 3. Create a new component to handle GeoJSON interactions
function GeoJsonLayer() {
  const map = useMap();

  const onEachFeature = (feature, layer) => {
    // This function runs for each state shape
    // It attaches event listeners for interactivity
    layer.on({
      click: (event) => {
        // When a state is clicked, zoom to its boundaries
        map.fitBounds(event.target.getBounds());
      },
      mouseover: (event) => {
        // Highlight the state on hover
        event.target.setStyle({ weight: 2.5, color: '#3b82f6', fillOpacity: 0.1 });
      },
      mouseout: (event) => {
        // Reset the style on mouse out
        event.target.setStyle({ weight: 1, color: '#3388ff', fillOpacity: 0 });
      },
    });
  };

  const geoJsonStyle = {
    fillOpacity: 0, // Make states transparent
    weight: 1,
    color: '#3388ff', // Blue borders
  };

  return <GeoJSON data={statesData.features} style={geoJsonStyle} onEachFeature={onEachFeature} />;
}


export default function AdminMap() {
  const [filters, setFilters] = useState({ status: ['On Track', 'Delayed', 'Completed'], component: 'all', search: '' });

  const handleStatusChange = (status, checked) => {
    setFilters(prev => ({ ...prev, status: checked ? [...prev.status, status] : prev.status.filter(s => s !== status) }));
  };

  const filteredProjects = useMemo(() => {
    return mockProjects.filter(p => 
      filters.status.includes(p.status) &&
      (filters.component === 'all' || p.component === filters.component) &&
      (p.name.toLowerCase().includes(filters.search.toLowerCase()) || p.agency.toLowerCase().includes(filters.search.toLowerCase()))
    );
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <MapIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3yl font-bold">GIS Map View</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[75vh]">
        {/* Left Column: Filters & Legend */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Search project or agency..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
              <div>
                <Label>Status</Label>
                {['On Track', 'Delayed', 'Completed'].map(status => (
                  <div key={status} className="flex items-center space-x-2 mt-2">
                    <Checkbox id={status} checked={filters.status.includes(status)} onCheckedChange={(checked) => handleStatusChange(status, checked)} />
                    <Label htmlFor={status} className="font-normal">{status}</Label>
                  </div>
                ))}
              </div>
              <div>
                <Label>Component</Label>
                <Select value={filters.component} onValueChange={value => setFilters({...filters, component: value})}>
                  <SelectTrigger><SelectValue placeholder="All Components" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Components</SelectItem>
                    <SelectItem value="Adarsh Gram">Adarsh Gram</SelectItem>
                    <SelectItem value="GIA">GIA</SelectItem>
                    <SelectItem value="Hostel">Hostel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Legend</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span className="text-sm">On Track</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500"></div><span className="text-sm">Delayed</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500"></div><span className="text-sm">Completed</span></div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Map */}
        <div className="lg:col-span-3 h-full">
          <Card className="h-full">
            <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* 4. Add the new GeoJSON layer to the map */}
              <GeoJsonLayer />

              {filteredProjects.map(project => (
                <Marker key={project.id} position={project.position} icon={getIcon(project.status)}>
                  <Popup>
                    <div className="font-semibold">{project.name}</div>
                    <div><strong>Status:</strong> {project.status}</div>
                    <div><strong>Component:</strong> {project.component}</div>
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