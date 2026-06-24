import axios from 'axios';

// OpenStreetMap Nominatim API (FREE)
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export interface GeocodingResult {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: [string, string, string, string];
}

export interface ReverseGeocodingResult {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    [key: string]: string;
  };
  boundingbox: [string, string, string, string];
}

export class GeocodingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = NOMINATIM_BASE_URL;
  }

  // Search for places by name
  async search(query: string): Promise<GeocodingResult[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 10,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'SaveHer App (Emergency Safety System)',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Geocoding search error:', error);
      throw new Error('Failed to search for locations');
    }
  }

  // Reverse geocoding - get address from coordinates
  async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
    try {
      const response = await axios.get(`${this.baseUrl}/reverse`, {
        params: {
          lat: lat.toString(),
          lon: lng.toString(),
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'SaveHer App (Emergency Safety System)',
        },
      });

      if (!response.data) {
        throw new Error('No address found for coordinates');
      }

      return response.data;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to get address from coordinates');
    }
  }

  // Get bounding box coordinates for a location (useful for creating danger zones)
  async getBoundingBoxForLocation(query: string): Promise<[number, number][] | null> {
    try {
      const results = await this.search(query);
      if (results.length === 0) return null;

      const result = results[0];
      const bbox = result.boundingbox;
      
      // Convert bounding box to polygon coordinates
      const [south, north, west, east] = bbox.map(Number);
      
      // Create a rectangular polygon around the location
      const coordinates: [number, number][] = [
        [north, west],   // Top-left
        [north, east],   // Top-right
        [south, east],   // Bottom-right
        [south, west],   // Bottom-left
        [north, west],   // Close the polygon
      ];

      return coordinates;
    } catch (error) {
      console.error('Error getting bounding box:', error);
      return null;
    }
  }

  // Create a smaller danger zone around a point (radius-based)
  async createDangerZoneAroundPoint(lat: number, lon: number, radiusKm: number = 0.5): Promise<[number, number][]> {
    // Approximately 1 degree = 111 km
    const degreeOffset = radiusKm / 111;
    
    const coordinates: [number, number][] = [
      [lat + degreeOffset, lon - degreeOffset],  // Top-left
      [lat + degreeOffset, lon + degreeOffset],  // Top-right
      [lat - degreeOffset, lon + degreeOffset],  // Bottom-right
      [lat - degreeOffset, lon - degreeOffset],  // Bottom-left
      [lat + degreeOffset, lon - degreeOffset],  // Close polygon
    ];

    return coordinates;
  }
}

export const geocodingService = new GeocodingService();
