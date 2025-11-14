// Database utilities for AERAS system
// Using in-memory storage for demo (can be replaced with PostgreSQL/MongoDB)

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  blockId: string;
}

export interface User {
  id: string;
  name: string;
  age: number;
  userType: 'senior' | 'special_needs';
  privilegeVerified: boolean;
  createdAt: string;
}

export interface Puller {
  id: string;
  name: string;
  phone: string;
  currentLatitude?: number;
  currentLongitude?: number;
  isOnline: boolean;
  points: number;
  totalRides: number;
  createdAt: string;
}

export interface Ride {
  id: string;
  userId: string;
  pullerId?: string;
  pickupLocationId: string;
  destinationLocationId: string;
  status: 'pending' | 'accepted' | 'pickup_confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  pointsAwarded?: number;
  pointsStatus: 'pending' | 'rewarded' | 'under_review';
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
  distanceFromBlock?: number;
  createdAt: string;
  acceptedAt?: string;
  pickupConfirmedAt?: string;
  completedAt?: string;
}

export interface PointsHistory {
  id: string;
  pullerId: string;
  rideId: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  description: string;
  createdAt: string;
}

// Demo location blocks (CUET Campus)
export const LOCATIONS: Location[] = [
  {
    id: 'loc_1',
    name: 'CUET Campus',
    latitude: 22.4633,
    longitude: 91.9714,
    blockId: 'block_cuet'
  },
  {
    id: 'loc_2',
    name: 'Pahartoli',
    latitude: 22.4725,
    longitude: 91.9845,
    blockId: 'block_pahartoli'
  },
  {
    id: 'loc_3',
    name: 'Noapara',
    latitude: 22.4580,
    longitude: 91.9920,
    blockId: 'block_noapara'
  },
  {
    id: 'loc_4',
    name: 'Raojan',
    latitude: 22.4520,
    longitude: 91.9650,
    blockId: 'block_raojan'
  }
];

// In-memory storage (replace with actual database in production)
class Database {
  private users: Map<string, User> = new Map();
  private pullers: Map<string, Puller> = new Map();
  private rides: Map<string, Ride> = new Map();
  private pointsHistory: Map<string, PointsHistory[]> = new Map();
  private activeRequests: Map<string, Ride> = new Map();

  // Users
  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Pullers
  createPuller(puller: Omit<Puller, 'id' | 'createdAt' | 'points' | 'totalRides'>): Puller {
    const id = `puller_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newPuller: Puller = {
      ...puller,
      id,
      points: 0,
      totalRides: 0,
      createdAt: new Date().toISOString()
    };
    this.pullers.set(id, newPuller);
    return newPuller;
  }

  getPuller(id: string): Puller | undefined {
    return this.pullers.get(id);
  }

  getAllPullers(): Puller[] {
    return Array.from(this.pullers.values());
  }

  getOnlinePullers(): Puller[] {
    return Array.from(this.pullers.values()).filter(p => p.isOnline);
  }

  updatePullerLocation(id: string, latitude: number, longitude: number): void {
    const puller = this.pullers.get(id);
    if (puller) {
      puller.currentLatitude = latitude;
      puller.currentLongitude = longitude;
    }
  }

  updatePullerPoints(id: string, points: number): void {
    const puller = this.pullers.get(id);
    if (puller) {
      puller.points += points;
      puller.totalRides += 1;
    }
  }

  // Rides
  createRide(ride: Omit<Ride, 'id' | 'createdAt' | 'status' | 'pointsStatus'>): Ride {
    const id = `ride_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRide: Ride = {
      ...ride,
      id,
      status: 'pending',
      pointsStatus: 'pending',
      createdAt: new Date().toISOString()
    };
    this.rides.set(id, newRide);
    this.activeRequests.set(id, newRide);
    return newRide;
  }

  getRide(id: string): Ride | undefined {
    return this.rides.get(id);
  }

  getAllRides(): Ride[] {
    return Array.from(this.rides.values());
  }

  getActiveRequests(): Ride[] {
    return Array.from(this.activeRequests.values()).filter(r => r.status === 'pending');
  }

  updateRide(id: string, updates: Partial<Ride>): Ride | undefined {
    const ride = this.rides.get(id);
    if (ride) {
      const updated = { ...ride, ...updates };
      this.rides.set(id, updated);
      
      if (updated.status !== 'pending') {
        this.activeRequests.delete(id);
      } else {
        this.activeRequests.set(id, updated);
      }
      
      return updated;
    }
    return undefined;
  }

  getRidesByPuller(pullerId: string, limit: number = 10): Ride[] {
    return Array.from(this.rides.values())
      .filter(r => r.pullerId === pullerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Points History
  addPointsHistory(history: Omit<PointsHistory, 'id' | 'createdAt'>): PointsHistory {
    const id = `ph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newHistory: PointsHistory = {
      ...history,
      id,
      createdAt: new Date().toISOString()
    };
    
    if (!this.pointsHistory.has(history.pullerId)) {
      this.pointsHistory.set(history.pullerId, []);
    }
    this.pointsHistory.get(history.pullerId)!.push(newHistory);
    return newHistory;
  }

  getPointsHistory(pullerId: string): PointsHistory[] {
    return this.pointsHistory.get(pullerId) || [];
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  // Calculate points based on distance from block
  calculatePoints(distanceFromBlock: number): number {
    const basePoints = 10;
    const distancePenalty = distanceFromBlock / 10; // 1 point per 10m
    const finalPoints = Math.max(0, basePoints - distancePenalty);
    return Math.round(finalPoints * 10) / 10; // Round to 1 decimal
  }
}

export const db = new Database();

