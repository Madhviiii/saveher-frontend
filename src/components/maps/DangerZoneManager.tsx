import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin,
  Save,
  X,
  Search,
  Loader2,
  Map,
  MousePointer
} from 'lucide-react';
import { DangerZone, dangerZoneManager } from '@/lib/dangerZones';
import { geocodingService, GeocodingResult } from '@/lib/geocoding';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

interface DangerZoneManagerProps {
  onZonesChange?: (zones: DangerZone[]) => void;
}

// Map drawing component
const MapDrawingTool: React.FC<{
  onPointsChange: (points: [number, number][]) => void;
  points: [number, number][];
  isDrawing: boolean;
}> = ({ onPointsChange, points, isDrawing }) => {
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (isDrawing) {
          const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
          onPointsChange([...points, newPoint]);
        }
      },
    });
    return null;
  };

  return (
    <>
      <MapClickHandler />
      {points.length > 0 && (
        <Polygon
          positions={points}
          pathOptions={{
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.3,
            weight: 2,
          }}
        />
      )}
      {points.map((point, index) => (
        <Marker
          key={index}
          position={point}
          icon={L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background: red; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}
        />
      ))}
    </>
  );
};

const DangerZoneManager: React.FC<DangerZoneManagerProps> = ({ onZonesChange }) => {
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [editingZone, setEditingZone] = useState<DangerZone | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [useMapCreation, setUseMapCreation] = useState(false);
  const [mapPoints, setMapPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    crimeRate: 'medium' as 'low' | 'medium' | 'high',
    description: '',
    coordinates: '' as string,
  });

  useEffect(() => {
    loadDangerZones();
  }, []);

  const loadDangerZones = () => {
    const zones = dangerZoneManager.getAllDangerZones();
    setDangerZones(zones);
    onZonesChange?.(zones);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      area: '',
      crimeRate: 'medium',
      description: '',
      coordinates: '',
    });
    setSearchQuery('');
    setSearchResults([]);
    setMapPoints([]);
    setIsDrawing(false);
    setUseMapCreation(false);
    // Don't reset isAddingZone and editingZone here - they're managed separately
  };

  const closeForm = () => {
    setIsAddingZone(false);
    setEditingZone(null);
    resetForm();
  };

  const handleMapPointsChange = (points: [number, number][]) => {
    setMapPoints(points);
    // Update coordinates in form
    const coordString = points.map(coord => `${coord[0]},${coord[1]}`).join(';');
    setFormData({ ...formData, coordinates: coordString });
  };

  const startMapDrawing = () => {
    setMapPoints([]);
    setIsDrawing(true);
    setUseMapCreation(true);
    toast.info('Click on the map to add points for the danger zone boundary');
  };

  const stopMapDrawing = () => {
    setIsDrawing(false);
    if (mapPoints.length < 3) {
      toast.error('At least 3 points are required to create a danger zone');
      setMapPoints([]);
      setFormData({ ...formData, coordinates: '' });
    } else {
      toast.success(`Created danger zone with ${mapPoints.length} points`);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a location to search');
      return;
    }

    console.log('Searching for location:', searchQuery);
    setIsSearching(true);
    try {
      const results = await geocodingService.searchLocation(searchQuery);
      console.log('Search results:', results);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info('No locations found. Try a different search term.');
      } else {
        toast.success(`Found ${results.length} location(s)`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search location. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = async (result: GeocodingResult) => {
    try {
      const coordinates = await geocodingService.getBoundingBoxForLocation(result.display_name);
      if (coordinates) {
        const coordString = coordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');
        setFormData({
          ...formData,
          name: result.display_name.split(',')[0],
          area: result.address.city || result.address.county || 'Unknown',
          coordinates: coordString,
        });
        setSearchResults([]);
        setSearchQuery('');
        toast.success('Location coordinates added');
      }
    } catch (error) {
      toast.error('Failed to get location coordinates');
    }
  };

  const handleAddZone = () => {
    console.log('🚀 Add Zone button clicked!');
    console.log('📊 Current state:', { isAddingZone, editingZone });
    
    try {
      // First reset the form data
      resetForm();
      
      // Then set the state for adding
      setIsAddingZone(true);
      setEditingZone(null);
      
      console.log('✅ Add Zone setup completed');
      console.log('📊 New state:', { isAddingZone: true, editingZone: null });
    } catch (error) {
      console.error('❌ Error in handleAddZone:', error);
      toast.error('Failed to open add zone form');
    }
  };

  const handleEditZone = (zone: DangerZone) => {
    setEditingZone(zone);
    setIsAddingZone(false);
    setFormData({
      name: zone.name,
      area: zone.area,
      crimeRate: zone.crimeRate,
      description: zone.description,
      coordinates: zone.coordinates.map(coord => `${coord[0]},${coord[1]}`).join(';'),
    });
  };

  const handleDeleteZone = (id: string) => {
    if (window.confirm('Are you sure you want to delete this danger zone?')) {
      const success = dangerZoneManager.deleteDangerZone(id);
      if (success) {
        toast.success('Danger zone deleted');
        loadDangerZones();
      } else {
        toast.error('Failed to delete danger zone');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started:', formData);
    console.log('📍 Map points:', mapPoints);
    console.log('🗺️ Use map creation:', useMapCreation);
    
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        console.error('❌ Missing zone name');
        toast.error('Zone name is required');
        return;
      }
      if (!formData.area.trim()) {
        console.error('❌ Missing area');
        toast.error('Area is required');
        return;
      }
      if (!formData.coordinates.trim()) {
        console.error('❌ Missing coordinates');
        toast.error('Coordinates are required');
        return;
      }
      
      console.log('✅ Basic validation passed');
      
      // Parse coordinates
      const coords = formData.coordinates.split(';').map(coord => {
        const [lat, lng] = coord.trim().split(',').map(Number);
        if (isNaN(lat) || isNaN(lng)) {
          console.error('❌ Invalid coordinate:', coord);
          throw new Error(`Invalid coordinates format: ${coord}`);
        }
        return [lat, lng] as [number, number];
      });

      console.log('📍 Parsed coordinates:', coords);

      if (coords.length < 3) {
        console.error('❌ Not enough points:', coords.length);
        toast.error(`At least 3 coordinate points are required. You have ${coords.length}`);
        return;
      }

      const zoneData = {
        name: formData.name.trim(),
        area: formData.area.trim(),
        crimeRate: formData.crimeRate as 'low' | 'medium' | 'high',
        description: formData.description.trim(),
        coordinates: coords,
      };

      console.log('💾 Zone data to save:', zoneData);

      if (editingZone) {
        console.log('🔄 Updating existing zone:', editingZone.id);
        const updated = dangerZoneManager.updateDangerZone(editingZone.id, zoneData);
        if (updated) {
          console.log('✅ Zone updated successfully');
          toast.success('Danger zone updated');
        } else {
          console.error('❌ Failed to update zone');
          throw new Error('Failed to update danger zone');
        }
      } else {
        console.log('➕ Adding new zone');
        const newZone = dangerZoneManager.addDangerZone(zoneData);
        console.log('✅ New zone created:', newZone);
        toast.success('Danger zone added successfully!');
      }

      console.log('🔄 Reloading zones...');
      loadDangerZones();
      console.log('🔄 Resetting form...');
      resetForm();
    } catch (error) {
      console.error('❌ Form submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Invalid data format');
    }
  };

  // Test function to verify danger zone manager
  const testDangerZoneManager = () => {
    try {
      console.log('🧪 Testing danger zone manager...');
      const testZone = dangerZoneManager.addDangerZone({
        name: 'Test Zone',
        area: 'Test Area',
        crimeRate: 'medium',
        description: 'Test description',
        coordinates: [[28.6139, 77.2090], [28.6149, 77.2090], [28.6149, 77.2100], [28.6139, 77.2100]]
      });
      console.log('✅ Test zone created:', testZone);
      
      const allZones = dangerZoneManager.getAllDangerZones();
      console.log('📊 All zones:', allZones);
      
      // Clean up test zone
      dangerZoneManager.deleteDangerZone(testZone.id);
      console.log('🧹 Test zone cleaned up');
      
      toast.success('Danger zone manager is working correctly!');
    } catch (error) {
      console.error('❌ Danger zone manager test failed:', error);
      toast.error('Danger zone manager has issues');
    }
  };

  const getCrimeRateColor = (rate: string) => {
    switch (rate) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone Management
              </CardTitle>
              <CardDescription>
                Manage high-crime areas and safety zones
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testDangerZoneManager}
                className="text-xs"
              >
                🧪 Test
              </Button>
              <Button 
              onClick={(e) => {
                console.log(' Button clicked!', e);
                e.preventDefault();
                e.stopPropagation();
                handleAddZone();
              }} 
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Zone
            </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Debug Info */}
      <div className="text-xs bg-gray-100 p-2 rounded">
        Debug: isAddingZone={String(isAddingZone)}, editingZone={editingZone?.id || 'null'}
      </div>

      {/* Add/Edit Form */}
      {(isAddingZone || editingZone) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingZone ? 'Edit Danger Zone' : 'Add New Danger Zone'}</span>
              <Button variant="ghost" size="sm" onClick={closeForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Zone Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., North Delhi High Risk Area"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area/City</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g., North Delhi"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="crimeRate">Crime Rate</Label>
                <Select value={formData.crimeRate} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, crimeRate: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the danger zone and safety concerns..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="coordinates">
                  Danger Zone Boundary <span className="text-xs text-muted-foreground">
                    (Create using map or enter coordinates)
                  </span>
                </Label>
                
                {/* Creation Method Toggle */}
                <div className="mb-3 flex gap-2">
                  <Button
                    type="button"
                    variant={useMapCreation ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseMapCreation(true)}
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Draw on Map
                  </Button>
                  <Button
                    type="button"
                    variant={!useMapCreation ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseMapCreation(false)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Manual Entry
                  </Button>
                </div>

                {/* Map-based Creation */}
                {useMapCreation && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="text-sm">
                        {isDrawing ? (
                          <span className="text-blue-600 font-medium">
                            Click on the map to add boundary points
                          </span>
                        ) : mapPoints.length > 0 ? (
                          <span className="text-green-600 font-medium">
                            {mapPoints.length} points added
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Ready to draw danger zone
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {isDrawing ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={stopMapDrawing}
                          >
                            Stop Drawing
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={startMapDrawing}
                          >
                            <MousePointer className="h-4 w-4 mr-2" />
                            Start Drawing
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Interactive Map */}
                    <div className="h-64 border rounded-lg overflow-hidden">
                      <MapContainer
                        center={[28.6139, 77.2090]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapDrawingTool
                          onPointsChange={handleMapPointsChange}
                          points={mapPoints}
                          isDrawing={isDrawing}
                        />
                      </MapContainer>
                    </div>

                    {mapPoints.length > 0 && mapPoints.length < 3 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Add {3 - mapPoints.length} more point{3 - mapPoints.length > 1 ? 's' : ''} to complete the danger zone boundary.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Manual Entry */}
                {!useMapCreation && (
                  <div className="space-y-3">
                    {/* Location Search */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Search location by name (e.g., Connaught Place, Delhi)"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleSearch}
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="border rounded-lg max-h-32 overflow-y-auto">
                        {searchResults.map((result) => (
                          <button
                            key={result.place_id}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-b-0"
                            onClick={() => handleSelectLocation(result)}
                          >
                            <div className="font-medium">{result.display_name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <Textarea
                      id="coordinates"
                      value={formData.coordinates}
                      onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                      placeholder="28.7266,77.1234;28.7266,77.1334;28.7166,77.1334;28.7166,77.1234"
                      rows={2}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter coordinates in order to create a polygon. Minimum 3 points required.
                      Or search for a location above to auto-fill coordinates.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingZone ? 'Update Zone' : 'Add Zone'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          <strong>How to add coordinates:</strong> Use Google Maps to find the area, 
          then click on multiple points around the perimeter to get lat/lng coordinates. 
          Enter them in order: lat1,lng1;lat2,lng2;lat3,lng3;...
        </AlertDescription>
      </Alert>

      {/* Danger Zones List */}
      <div className="grid gap-4">
        {dangerZones.map((zone) => (
          <Card key={zone.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{zone.name}</h3>
                    <Badge variant={getCrimeRateColor(zone.crimeRate)}>
                      {zone.crimeRate.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{zone.area}</p>
                  <p className="text-sm mb-2">{zone.description}</p>
                  <div className="text-xs text-muted-foreground">
                    <p>Coordinates: {zone.coordinates.length} points</p>
                    <p>Last updated: {zone.lastUpdated.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditZone(zone)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteZone(zone.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {dangerZones.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Danger Zones</h3>
            <p className="text-muted-foreground mb-4">
              Add danger zones to get alerts when entering high-crime areas
            </p>
            <Button onClick={handleAddZone}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Danger Zone
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DangerZoneManager;
