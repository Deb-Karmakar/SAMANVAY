import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { 
  MapPin, 
  LocateFixed, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Building,
  Target
} from "lucide-react";
import L from 'leaflet';
import { axiosInstance } from "@/contexts/AuthContext";

// ====================================
// 🎨 CUSTOM LEAFLET ICONS
// ====================================
const getIcon = (status) => {
  const colorMap = {
    'On Track': '#22c55e',
    'Delayed': '#ef4444',
    'Completed': '#3b82f6',
    'Planning': '#f59e0b'
  };
  
  const color = colorMap[status] || '#6b7280';
  
  const html = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  
  return L.divIcon({ 
    html: html, 
    className: 'custom-marker', 
    iconSize: [32, 32], 
    iconAnchor: [16, 32], 
    popupAnchor: [0, -32] 
  });
};

// ====================================
// 🗺️ AUTO FIT BOUNDS COMPONENT
// ====================================
const AutoFitBounds = ({ markers }) => {
    const map = useMap();
    
    useEffect(() => {
        if (!markers || markers.length === 0) return;
        
        const validMarkers = markers.filter(m => 
            m.location?.coordinates && 
            m.location.coordinates.length === 2
        );
        
        if (validMarkers.length === 0) return;
        
        const bounds = L.latLngBounds(
            validMarkers.map(m => [
                m.location.coordinates[1], 
                m.location.coordinates[0]
            ])
        );
        
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }, [markers, map]);
    
    return null;
};

// ====================================
// 📍 MAIN COMPONENT
// ====================================
export default function AgencyMap() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);

  // ====================================
  // 📡 FETCH PROJECTS
  // ====================================
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching agency project locations...');
      
      // Use axiosInstance - baseURL already includes '/api/'
      const response = await axiosInstance.get('projects/locations/myagency');

      console.log('Projects received:', response.data);
      setProjects(response.data);
      
      if (response.data.length === 0) {
        setError('No projects with location data found for your agency.');
      }
      
    } catch (err) {
      console.error('Error fetching projects:', err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this data.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load projects');
      }
    } finally {
      setLoading(false);
    }
  };

  // ====================================
  // 🎯 RECENTER MAP
  // ====================================
  const handleRecenter = () => {
    if (!map || projects.length === 0) return;
    
    const validProjects = projects.filter(p => 
      p.location?.coordinates && 
      p.location.coordinates.length === 2
    );
    
    if (validProjects.length === 0) return;
    
    const bounds = L.latLngBounds(
      validProjects.map(p => [
        p.location.coordinates[1], 
        p.location.coordinates[0]
      ])
    );
    
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
  };

  // ====================================
  // 🎨 RENDER
  // ====================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Building className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">My Project Locations</h1>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Map Card */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Project Map</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchProjects}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRecenter}
              disabled={loading || projects.length === 0}
            >
              <Target className="h-4 w-4 mr-2" /> 
              Recenter
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="h-[60vh] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-600">Loading project locations...</p>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="h-[60vh] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No Projects Found</p>
                <p className="text-gray-500 text-sm mt-2">
                  No projects with location data are currently assigned to your agency.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[60vh] rounded-lg overflow-hidden border">
              <MapContainer 
                center={[20.5937, 78.9629]} 
                zoom={5} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
                ref={setMap}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {projects.map((project) => {
                  if (!project.location?.coordinates || project.location.coordinates.length !== 2) {
                    return null;
                  }
                  
                  const [lng, lat] = project.location.coordinates;
                  
                  return (
                    <Marker 
                      key={project._id} 
                      position={[lat, lng]} 
                      icon={getIcon(project.status)}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <h3 className="font-bold text-base mb-2">{project.name}</h3>
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="font-semibold">Status:</span>{' '}
                              <span className={`font-medium ${
                                project.status === 'On Track' ? 'text-green-600' :
                                project.status === 'Delayed' ? 'text-red-600' :
                                'text-blue-600'
                              }`}>
                                {project.status}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold">Progress:</span> {project.progress}%
                            </div>
                            <div>
                              <span className="font-semibold">Location:</span> {project.district}, {project.state}
                            </div>
                            {project.component && (
                              <div>
                                <span className="font-semibold">Component:</span> {project.component}
                              </div>
                            )}
                            {project.budget && (
                              <div>
                                <span className="font-semibold">Budget:</span> ₹{(project.budget / 10000000).toFixed(2)} Cr
                              </div>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                
                <AutoFitBounds markers={projects} />
              </MapContainer>
            </div>
          )}
          
          {/* Project Count */}
          {!loading && projects.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {projects.length} project{projects.length !== 1 ? 's' : ''} on map
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">On Track</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium">Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">Planning</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}