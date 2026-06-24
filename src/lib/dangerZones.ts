export interface DangerZone {
  id: string;
  name: string;
  coordinates: [number, number][];
  crimeRate: 'low' | 'medium' | 'high';
  description: string;
  area: string;
  lastUpdated: Date;
}

// Sample danger zones data - in a real app, this would come from a database
export const sampleDangerZones: DangerZone[] = [
  {
    id: '1',
    name: 'North Delhi High Risk Area',
    coordinates: [
      [28.7266, 77.1234],
      [28.7266, 77.1334],
      [28.7166, 77.1334],
      [28.7166, 77.1234],
    ],
    crimeRate: 'high',
    description: 'High crime rate area reported for theft and harassment. Avoid after dark.',
    area: 'North Delhi',
    lastUpdated: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'South Delhi Medium Risk Zone',
    coordinates: [
      [28.5266, 77.2034],
      [28.5266, 77.2134],
      [28.5166, 77.2134],
      [28.5166, 77.2034],
    ],
    crimeRate: 'medium',
    description: 'Medium risk area with occasional reports of eve-teasing and snatching.',
    area: 'South Delhi',
    lastUpdated: new Date('2024-01-10'),
  },
  {
    id: '3',
    name: 'East Delhi Low Risk Area',
    coordinates: [
      [28.6266, 77.2834],
      [28.6266, 77.2934],
      [28.6166, 77.2934],
      [28.6166, 77.2834],
    ],
    crimeRate: 'low',
    description: 'Generally safe area with minor incidents reported.',
    area: 'East Delhi',
    lastUpdated: new Date('2024-01-08'),
  },
  {
    id: '4',
    name: 'Central Delhi Danger Zone',
    coordinates: [
      [28.6366, 77.2034],
      [28.6366, 77.2234],
      [28.6266, 77.2234],
      [28.6266, 77.2034],
    ],
    crimeRate: 'high',
    description: 'High traffic area with frequent reports of pickpocketing and harassment.',
    area: 'Central Delhi',
    lastUpdated: new Date('2024-01-12'),
  },
];

export class DangerZoneManager {
  private static instance: DangerZoneManager;
  private dangerZones: DangerZone[] = [];

  private constructor() {
    this.loadDangerZones();
  }

  static getInstance(): DangerZoneManager {
    if (!DangerZoneManager.instance) {
      DangerZoneManager.instance = new DangerZoneManager();
    }
    return DangerZoneManager.instance;
  }

  private loadDangerZones() {
    const stored = localStorage.getItem('dangerZones');
    if (stored) {
      try {
        this.dangerZones = JSON.parse(stored).map((zone: any) => ({
          ...zone,
          lastUpdated: new Date(zone.lastUpdated),
        }));
      } catch {
        this.dangerZones = sampleDangerZones;
        this.saveDangerZones();
      }
    } else {
      this.dangerZones = sampleDangerZones;
      this.saveDangerZones();
    }
  }

  private saveDangerZones() {
    localStorage.setItem('dangerZones', JSON.stringify(this.dangerZones));
  }

  getAllDangerZones(): DangerZone[] {
    return this.dangerZones;
  }

  getDangerZoneById(id: string): DangerZone | undefined {
    return this.dangerZones.find(zone => zone.id === id);
  }

  addDangerZone(zone: Omit<DangerZone, 'id' | 'lastUpdated'>): DangerZone {
    const newZone: DangerZone = {
      ...zone,
      id: crypto.randomUUID(),
      lastUpdated: new Date(),
    };
    this.dangerZones.push(newZone);
    this.saveDangerZones();
    return newZone;
  }

  updateDangerZone(id: string, updates: Partial<Omit<DangerZone, 'id'>>): DangerZone | null {
    const index = this.dangerZones.findIndex(zone => zone.id === id);
    if (index === -1) return null;

    this.dangerZones[index] = {
      ...this.dangerZones[index],
      ...updates,
      lastUpdated: new Date(),
    };
    this.saveDangerZones();
    return this.dangerZones[index];
  }

  deleteDangerZone(id: string): boolean {
    const index = this.dangerZones.findIndex(zone => zone.id === id);
    if (index === -1) return false;

    this.dangerZones.splice(index, 1);
    this.saveDangerZones();
    return true;
  }

  getDangerZonesByArea(area: string): DangerZone[] {
    return this.dangerZones.filter(zone => 
      zone.area.toLowerCase().includes(area.toLowerCase())
    );
  }

  getDangerZonesByCrimeRate(crimeRate: 'low' | 'medium' | 'high'): DangerZone[] {
    return this.dangerZones.filter(zone => zone.crimeRate === crimeRate);
  }

  isPointInDangerZone(lat: number, lng: number): DangerZone | null {
    for (const zone of this.dangerZones) {
      if (this.isPointInPolygon({ lat, lng }, zone.coordinates)) {
        return zone;
      }
    }
    return null;
  }

  private isPointInPolygon(point: { lat: number; lng: number }, polygon: [number, number][]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][1], yi = polygon[i][0];
      const xj = polygon[j][1], yj = polygon[j][0];
      
      const intersect = ((yi > point.lat) !== (yj > point.lat))
          && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // Initialize with sample data if no data exists
  initializeSampleData() {
    if (this.dangerZones.length === 0) {
      this.dangerZones = sampleDangerZones;
      this.saveDangerZones();
    }
  }
}

// Export singleton instance
export const dangerZoneManager = DangerZoneManager.getInstance();
