// Report and Violation types
export interface Violation {
  violation_id: string;
  type: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  image_url: string;
  drone_id: string;
  date: string;
  location: string;
  created_at?: string;
}

export interface Report {
  drone_id: string;
  date: string;
  location: string;
  violations: Omit<Violation, 'drone_id' | 'date' | 'location' | 'created_at'>[];
}

export interface KPIResponse {
  total: number;
  byType: { type: string; count: number }[];
  byDrone: { drone_id: string; count: number }[];
  byLocation: { location: string; count: number }[];
  overTime: { date: string; count: number }[];
}

export interface KPIData {
  total: number;
  byType: Array<{ type: string; count: number }>;
  byDrone: Array<{ drone_id: string; count: number }>;
  byLocation: Array<{ location: string; count: number }>;
  overTime: Array<{ date: string; count: number }>;
}

export interface Filters {
  droneId: string;
  date: string;
  type: string;
}

export interface FilterOptions {
  droneIds: string[];
  dates: string[];
  types: string[];
}

// Authentication types
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
} 