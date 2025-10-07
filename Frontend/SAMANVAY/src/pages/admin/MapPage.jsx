// src/pages/admin/MapPage.jsx (Mobile Responsive Version - Fixed Sidebar Overlap)

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';
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
import { Map as MapIcon, Loader2, AlertTriangle, Filter, Layers, Info } from "lucide-react";
import L from 'leaflet';
import statesData from '@/assets/india-states.json';

// --- FINAL CORRECTED IMPORTS ---
import MarkerClusterGroup from 'react-leaflet-cluster';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';

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
function GeoJsonLayer({ projects }) {
    const map = useMap();
    
    const projectsByState = useMemo(() => {
        if (!projects) return {};
        
        return projects.reduce((acc, project) => {
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

// Filter Panel Component (Reusable for both mobile and desktop)
function FilterPanel({ filters, setFilters, handleStatusChange }) {
    return (
        <div className="space-y-4">
            <div>
                <Label className="font-semibold mb-2 block">Search</Label>
                <Input 
                    placeholder="Search project name..." 
                    value={filters.search} 
                    onChange={e => setFilters({...filters, search: e.target.value})} 
                    className="w-full"
                />
            </div>
            
            <div>
                <Label className="font-semibold mb-2 block">Status</Label>
                <div className="space-y-2">
                    {['On Track', 'Delayed', 'Completed'].map(status => (
                        <div key={status} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`mobile-${status}`} 
                                checked={filters.status.includes(status)} 
                                onCheckedChange={(checked) => handleStatusChange(status, checked)} 
                            />
                            <Label htmlFor={`mobile-${status}`} className="font-normal cursor-pointer">
                                {status}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
            
            <div>
                <Label className="font-semibold mb-2 block">Component</Label>
                <Select value={filters.component} onValueChange={value => setFilters({...filters, component: value})}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Components</SelectItem>
                        <SelectItem value="Adarsh Gram">Adarsh Gram</SelectItem>
                        <SelectItem value="GIA">GIA</SelectItem>
                        <SelectItem value="Hostel">Hostel</SelectItem>
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
                Heatmap shows project density, with higher intensity for delayed projects.
            </p>
        </div>
    );
}

// Legend Component
function Legend() {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#22c55e' }}></div>
                <span className="text-sm">On Track</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                <span className="text-sm">Delayed</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
                <span className="text-sm">Completed</span>
            </div>
        </div>
    );
}

export default function AdminMapPage() {
    const [filters, setFilters] = useState({ 
        status: ['On Track', 'Delayed', 'Completed'], 
        component: 'all', 
        search: '' 
    });
    const [heatmapVisible, setHeatmapVisible] = useState(false);

    const { data: projects, isLoading, isError } = useQuery({
        queryKey: ['projectLocations'],
        queryFn: fetchProjectLocations
    });

    const handleStatusChange = (status, checked) => {
        setFilters(prev => ({ 
            ...prev, 
            status: checked 
                ? [...prev.status, status] 
                : prev.status.filter(s => s !== status) 
        }));
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
        return (
            <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading Map Data...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-red-600">
                <AlertTriangle className="h-8 w-8 mr-2" />
                <span>Failed to load project locations.</span>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Container with proper padding for mobile sidebar */}
            <div className="w-full max-w-full overflow-hidden">
                <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-0">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <MapIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">GIS Dashboard</h1>
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
                                            handleStatusChange={handleStatusChange} 
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
                        {/* Left Column: Filters & Legend */}
                        <div className="lg:col-span-1 space-y-6 flex flex-col overflow-y-auto">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Filters</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FilterPanel 
                                        filters={filters} 
                                        setFilters={setFilters} 
                                        handleStatusChange={handleStatusChange} 
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

                        {/* Right Column: Map */}
                        <div className="lg:col-span-3 h-full">
                            <Card className="h-full overflow-hidden">
                                <MapContainer 
                                    center={[22, 82]} 
                                    zoom={5} 
                                    scrollWheelZoom={true} 
                                    style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                                >
                                    <TileLayer 
                                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' 
                                    />
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

                    {/* Mobile Layout - Adjusted for sidebar */}
                    <div className="lg:hidden -mx-4 sm:mx-0">
                        <Tabs defaultValue="map" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mx-4 sm:mx-0" style={{ width: 'calc(100% - 2rem)' }}>
                                <TabsTrigger value="map">Map</TabsTrigger>
                                <TabsTrigger value="info">Info</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="map" className="mt-4 px-4 sm:px-0">
                                <Card className="overflow-hidden">
                                    <div className="relative w-full" style={{ height: 'calc(100vh - 280px)', minHeight: '400px', maxHeight: '600px' }}>
                                        <MapContainer 
                                            center={[22, 82]} 
                                            zoom={5} 
                                            scrollWheelZoom={true} 
                                            style={{ 
                                                height: '100%', 
                                                width: '100%', 
                                                borderRadius: '0.5rem',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0
                                            }}
                                        >
                                            <TileLayer 
                                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' 
                                            />
                                            <GeoJsonLayer projects={projects || []} />

                                            {heatmapVisible ? (
                                                <HeatmapLayer
                                                    points={heatmapPoints}
                                                    longitudeExtractor={m => m[1]}
                                                    latitudeExtractor={m => m[0]}
                                                    intensityExtractor={m => m[2]}
                                                    radius={20}
                                                    blur={15}
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
                                                                <div className="text-sm">
                                                                    <div className="font-semibold">{project.name}</div>
                                                                    <div><strong>Status:</strong> {project.status}</div>
                                                                    <div><strong>Progress:</strong> {project.progress}%</div>
                                                                    <div><strong>Component:</strong> {project.component}</div>
                                                                    <div><strong>Budget:</strong> ₹{(project.budget / 10000000).toFixed(2)} Cr</div>
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
                                                <p className="text-2xl font-bold">{projects?.length || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Filtered</p>
                                                <p className="text-2xl font-bold">{filteredProjects.length}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">On Track</p>
                                                <p className="text-xl font-bold text-green-600">
                                                    {projects?.filter(p => p.status === 'On Track').length || 0}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Delayed</p>
                                                <p className="text-xl font-bold text-red-600">
                                                    {projects?.filter(p => p.status === 'Delayed').length || 0}
                                                </p>
                                            </div>
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