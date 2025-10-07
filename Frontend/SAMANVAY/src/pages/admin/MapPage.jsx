// src/pages/admin/MapPage.jsx (Final and Corrected for your installed packages)

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import { Map as MapIcon, Loader2, AlertTriangle } from "lucide-react";
import L from 'leaflet';
import statesData from '@/assets/india-states.json';

// --- FINAL CORRECTED IMPORTS ---
import MarkerClusterGroup from 'react-leaflet-cluster';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';

// --- FINAL CORRECTED CSS IMPORTS ---



// API function to fetch project locations from your backend
const fetchProjectLocations = async () => {
    const { data } = await axiosInstance.get('/projects/locations');
    return data;
};

// Custom Leaflet Icons based on project status
const getIcon = (status) => {
    const color = status === 'On Track' ? '#22c55e' : status === 'Delayed' ? '#ef4444' : '#3b82f6';
    const html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
    return L.divIcon({ html, className: 'custom-leaflet-icon', iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24] });
};

// Enhanced GeoJSON Layer with Project Counts
// In src/pages/admin/MapPage.jsx

function GeoJsonLayer({ projects }) {
    const map = useMap();
    
    const projectsByState = useMemo(() => {
        if (!projects) return {};
        
        return projects.reduce((acc, project) => {
            // --- ADDED THE CHECK FROM FIRST CODE ---
            // Only process projects that have a state property
            if (project && project.state) {
                const stateKey = project.state.trim();
                if (!acc[stateKey]) {
                    acc[stateKey] = { count: 0, delayed: 0 };
                }
                acc[stateKey].count++;
                if (project.status === 'Delayed') {
                    acc[stateKey].delayed++;
                }
            }
            return acc;
        }, {});
    }, [projects]);

    const onEachFeature = (feature, layer) => {
        // --- UPDATED WITH TRIM() FROM FIRST CODE ---
        const stateName = feature.properties.NAME_1;
        const stateData = projectsByState[stateName.trim()] || { count: 0, delayed: 0 };
        const popupContent = `
            <div class="font-bold text-base">${stateName}</div>
            <div><strong>Total Projects:</strong> ${stateData.count}</div>
            <div style="color: #ef4444;"><strong>Delayed:</strong> ${stateData.delayed}</div>
        `;
        layer.bindPopup(popupContent);
        
        layer.on({
            click: (e) => map.fitBounds(e.target.getBounds()),
            mouseover: (e) => e.target.setStyle({ weight: 2.5, color: '#3b82f6', fillOpacity: 0.1 }),
            mouseout: (e) => e.target.setStyle({ weight: 1, color: '#3388ff', fillOpacity: 0 }),
        });
    };

    const geoJsonStyle = {
        fillOpacity: 0,
        weight: 1,
        color: '#3388ff',
    };

    return <GeoJSON data={statesData} style={geoJsonStyle} onEachFeature={onEachFeature} />;
}

export default function AdminMapPage() {
    const [filters, setFilters] = useState({ status: ['On Track', 'Delayed', 'Completed'], component: 'all', search: '' });
    const [heatmapVisible, setHeatmapVisible] = useState(false);

    const { data: projects, isLoading, isError } = useQuery({
        queryKey: ['projectLocations'],
        queryFn: fetchProjectLocations
    });

    const handleStatusChange = (status, checked) => {
        setFilters(prev => ({ ...prev, status: checked ? [...prev.status, status] : prev.status.filter(s => s !== status) }));
    };

    const filteredProjects = useMemo(() => {
        if (!projects) return [];
        return projects.filter(p => 
            filters.status.includes(p.status) &&
            (filters.component === 'all' || p.component === filters.component) &&
            (p.name.toLowerCase().includes(filters.search.toLowerCase()))
        );
    }, [projects, filters]);

    const heatmapPoints = useMemo(() => {
        if (!projects) return [];
        return projects.map(p => [
            p.location.coordinates[1], // latitude
            p.location.coordinates[0], // longitude
            p.status === 'Delayed' ? 1.0 : 0.5 // Higher intensity for delayed projects
        ]);
    }, [projects]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-[80vh]"><Loader2 className="h-8 w-8 animate-spin mr-2" />Loading Map Data...</div>;
    }

    if (isError) {
        return <div className="flex items-center justify-center h-[80vh] text-red-600"><AlertTriangle className="h-8 w-8 mr-2" />Failed to load project locations.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <MapIcon className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">GIS Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[75vh]">
                {/* Left Column: Filters & Legend */}
                <div className="lg:col-span-1 space-y-6 flex flex-col">
                    <Card>
                        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Input placeholder="Search project name..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
                            <div>
                                <Label className="font-semibold">Status</Label>
                                {['On Track', 'Delayed', 'Completed'].map(status => (
                                    <div key={status} className="flex items-center space-x-2 mt-2"><Checkbox id={status} checked={filters.status.includes(status)} onCheckedChange={(checked) => handleStatusChange(status, checked)} /><Label htmlFor={status} className="font-normal">{status}</Label></div>
                                ))}
                            </div>
                            <div>
                                <Label className="font-semibold">Component</Label>
                                <Select value={filters.component} onValueChange={value => setFilters({...filters, component: value})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                         <CardHeader><CardTitle>Map View</CardTitle></CardHeader>
                         <CardContent>
                             <div className="flex items-center justify-between">
                                 <Label htmlFor="heatmap-toggle" className="font-semibold">Show Heatmap</Label>
                                 <Switch id="heatmap-toggle" checked={heatmapVisible} onCheckedChange={setHeatmapVisible} />
                             </div>
                             <p className="text-xs text-muted-foreground mt-2">Heatmap shows project density, with higher intensity for delayed projects.</p>
                         </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Legend</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#22c55e' }}></div><span className="text-sm">On Track</span></div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ef4444' }}></div><span className="text-sm">Delayed</span></div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div><span className="text-sm">Completed</span></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Map */}
                <div className="lg:col-span-3 h-full">
                    <Card className="h-full">
                        <MapContainer center={[22, 82]} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' />
                            <GeoJsonLayer projects={projects || []} />

                            {heatmapVisible ? (
                                <HeatmapLayer
                                    points={heatmapPoints}
                                    longitudeExtractor={m => m[1]}
                                    latitudeExtractor={m => m[0]}
                                    intensityExtractor={m => m[2]}
                                    radius={25}
                                    blur={20}
                                />
                            ) : (
                                <MarkerClusterGroup>
                                    {filteredProjects.map(project => (
                                        <Marker 
                                            key={project._id} 
                                            position={[project.location.coordinates[1], project.location.coordinates[0]]} 
                                            icon={getIcon(project.status)}
                                        >
                                            <Popup>
                                                <div className="font-semibold">{project.name}</div>
                                                <div><strong>Status:</strong> {project.status}</div>
                                                <div><strong>Progress:</strong> {project.progress}%</div>
                                                <div><strong>Component:</strong> {project.component}</div>
                                                <div><strong>Budget:</strong> ₹{(project.budget / 10000000).toFixed(2)} Cr</div>
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