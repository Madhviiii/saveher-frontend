import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { AlertTriangle, MapPin, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

// Types
interface DangerZone {
  id: string;
  name: string;
  coordinates: [number, number][];
  crimeRate: 'low' | 'medium' | 'high';
  description: string;
}

interface PathPoint {
  lat: number;
  lng: number;
  timestamp: Date;
}

interface SafetyMapProps {
  currentLocation: { lat: number; lng: number } | null;
  dangerZones: DangerZone[];
  pathHistory: PathPoint[];
  onDangerZoneEntry?: (zone: DangerZone) => void;
}

// Custom marker icons
const userIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#347777" fill-opacity="0.3" stroke="#347777" stroke-width="2"/>
      <circle cx="20" cy="20" r="8" fill="#347777"/>
      <circle cx="20" cy="20" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const dangerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 2L2 25H28L15 2Z" fill="#ef4444" fill-opacity="0.8" stroke="#ef4444" stroke-width="1"/>
      <path d="M15 10V15" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <path d="M15 18V19" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

// Map controller component
const MapController: React.FC<{
  currentLocation: { lat: number; lng: number } | null;
  dangerZones: DangerZone[];
  onDangerZoneEntry?: (zone: DangerZone) => void;
}> = ({ currentLocation, dangerZones, onDangerZoneEntry }) => {
  const map = useMap();
  const [lastNotifiedZone, setLastNotifiedZone] = useState<string | null>(null);

  useEffect(() => {
    if (currentLocation) {
      map.setView([currentLocation.lat, currentLocation.lng], 15);
      
      // Check if user is in any danger zone
      dangerZones.forEach(zone => {
        if (isPointInPolygon(currentLocation, zone.coordinates)) {
          if (lastNotifiedZone !== zone.id) {
            onDangerZoneEntry?.(zone);
            setLastNotifiedZone(zone.id);
          }
        }
      });
    }
  }, [currentLocation, map, dangerZones, onDangerZoneEntry, lastNotifiedZone]);

  return null;
};

// Helper function to check if point is in polygon
const isPointInPolygon = (point: { lat: number; lng: number }, polygon: [number, number][]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1], yi = polygon[i][0];
    const xj = polygon[j][1], yj = polygon[j][0];
    
    const intersect = ((yi > point.lat) !== (yj > point.lat))
        && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const SafetyMap: React.FC<SafetyMapProps> = ({
  currentLocation,
  dangerZones,
  pathHistory,
  onDangerZoneEntry,
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [isInDangerZone, setIsInDangerZone] = useState(false);
  const [currentDangerZone, setCurrentDangerZone] = useState<DangerZone | null>(null);

  useEffect(() => {
    // Import Leaflet CSS dynamically to avoid SSR issues
    import('leaflet/dist/leaflet.css').then(() => {
      setMapReady(true);
    });
  }, []);

  const handleDangerZoneEntry = (zone: DangerZone) => {
    setIsInDangerZone(true);
    setCurrentDangerZone(zone);
    
    toast.error(`⚠️ Danger Zone Alert!`, {
      description: `You've entered ${zone.name}. Crime rate: ${zone.crimeRate}`,
      duration: 8000,
    });

    onDangerZoneEntry?.(zone);
  };

  const getDangerZoneColor = (crimeRate: string) => {
    switch (crimeRate) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#eab308';
      default: return '#6b7280';
    }
  };

  const getDangerZoneOpacity = (crimeRate: string) => {
    switch (crimeRate) {
      case 'high': return 0.4;
      case 'medium': return 0.3;
      case 'low': return 0.2;
      default: return 0.2;
    }
  };

  if (!mapReady) {
    return (
      <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Danger Alert */}
      {isInDangerZone && currentDangerZone && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>Danger Zone Alert:</strong> You're in {currentDangerZone.name}. 
              Crime rate: <span className="font-semibold">{currentDangerZone.crimeRate}</span>
            </span>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => {
                toast.success('Guardians notified of your location');
              }}
            >
              Notify Guardians
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Safety Map
          </CardTitle>
          <CardDescription>
            Real-time location tracking with danger zone alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-xl overflow-hidden border">
            <MapContainer
              center={[currentLocation?.lat || 28.6139, currentLocation?.lng || 77.2090]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapController
                currentLocation={currentLocation}
                dangerZones={dangerZones}
                onDangerZoneEntry={handleDangerZoneEntry}
              />

              {/* User Location Marker */}
              {currentLocation && (
                <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">Your Location</p>
                      <p className="text-xs text-muted-foreground">
                        {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Danger Zones */}
              {dangerZones.map((zone) => (
                <Polygon
                  key={zone.id}
                  positions={zone.coordinates}
                  pathOptions={{
                    color: getDangerZoneColor(zone.crimeRate),
                    fillColor: getDangerZoneColor(zone.crimeRate),
                    fillOpacity: getDangerZoneOpacity(zone.crimeRate),
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <p className="font-semibold">{zone.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{zone.description}</p>
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                           style={{ 
                             backgroundColor: `${getDangerZoneColor(zone.crimeRate)}20`,
                             color: getDangerZoneColor(zone.crimeRate)
                           }}>
                        Crime Rate: {zone.crimeRate.toUpperCase()}
                      </div>
                    </div>
                  </Popup>
                </Polygon>
              ))}

              {/* Path History */}
              {pathHistory.length > 1 && (
                <Polyline
                  positions={pathHistory.map(point => [point.lat, point.lng])}
                  pathOptions={{
                    color: '#347777',
                    weight: 3,
                    opacity: 0.7,
                    dashArray: '5, 10',
                  }}
                />
              )}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Map Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full bg-primary"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 bg-red-500 rounded opacity-40"></div>
            <span>High Crime Rate Zone</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 bg-amber-500 rounded opacity-30"></div>
            <span>Medium Crime Rate Zone</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 bg-yellow-500 rounded opacity-20"></div>
            <span>Low Crime Rate Zone</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-0.5 bg-primary" style={{ borderTop: '2px dashed #347777' }}></div>
            <span>Your Path</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetyMap;
