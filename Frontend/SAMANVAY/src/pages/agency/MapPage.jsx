import { useEffect, useState } from 'react'; // <-- FIX: Added useState here
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, LocateFixed } from "lucide-react";
import L from 'leaflet';

// --- Mock Data for THIS Agency's Projects ---
const mockAgencyProjects = [
  { id: 'PROJ001', name: 'Jaipur Adarsh Gram Dev.', position: [26.9124, 75.7873], status: 'On Track' },
  { id: 'PROJ004', name: 'Ajmer Hostel Upgrade', position: [26.4499, 74.6399], status: 'On Track' },
  { id: 'PROJ008', name: 'Alwar Road Widening', position: [27.5530, 76.6346], status: 'Delayed' },
];

// --- Custom Leaflet Icons (reused from other pages) ---
const getIcon = (status) => {
  const color = status === 'On Track' ? '#22c55e' : status === 'Delayed' ? '#ef4444' : '#3b82f6';
  const html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
  return L.divIcon({ html: html, className: 'dummy', iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24] });
};

// --- Helper component to auto-zoom the map ---
const AutoFitBounds = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        if (!markers || markers.length === 0) return;
        const bounds = L.latLngBounds(markers.map(marker => marker.position));
        map.fitBounds(bounds, { padding: [50, 50] });
    }, [markers, map]);
    return null;
};

export default function AgencyMap() {

  const handleRecenter = (mapInstance) => {
    if (mapInstance) {
      const bounds = L.latLngBounds(mockAgencyProjects.map(marker => marker.position));
      mapInstance.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const [map, setMap] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <MapPin className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">My Project Locations</h1>
      </div>
      
      <Card>
        <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Project Map</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleRecenter(map)}>
                <LocateFixed className="h-4 w-4 mr-2" /> Recenter
            </Button>
        </CardHeader>
        <CardContent>
            <div className="h-[60vh] rounded-lg overflow-hidden">
                <MapContainer center={[26.8, 74.2]} zoom={7} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} ref={setMap}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {mockAgencyProjects.map(project => (
                        <Marker key={project.id} position={project.position} icon={getIcon(project.status)}>
                            <Popup>
                                <div className="font-semibold">{project.name}</div>
                                <div><strong>Status:</strong> {project.status}</div>
                            </Popup>
                        </Marker>
                    ))}
                    <AutoFitBounds markers={mockAgencyProjects} />
                </MapContainer>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Legend</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-6">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span className="text-sm">On Track</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500"></div><span className="text-sm">Delayed</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500"></div><span className="text-sm">Completed</span></div>
        </CardContent>
      </Card>
    </div>
  );
}