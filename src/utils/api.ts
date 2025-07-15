import { Report, Violation, KPIResponse, FilterOptions, Filters, LoginRequest, RegisterRequest, AuthResponse, User } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api';

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
}

// Helper function to make authenticated requests
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
  };
  
  // Only set Content-Type if it's not already set and body is not FormData
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

// Authentication API functions
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }
  
  return res.json();
}

export async function register(userData: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Registration failed');
  }
  
  return res.json();
}

export async function logout(): Promise<void> {
  const res = await authenticatedFetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
  });
  
  if (!res.ok) {
    console.error('Logout request failed');
  }
  
  // Clear local storage regardless
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

export async function getProfile(): Promise<User> {
  const res = await authenticatedFetch(`${API_BASE}/auth/profile`);
  
  if (!res.ok) {
    throw new Error('Failed to get profile');
  }
  
  const data = await res.json();
  return data.user;
}

export async function uploadReport(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('report', file);
  const res = await authenticatedFetch(`${API_BASE}/reports/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchViolations(filters: Partial<Filters> = {}): Promise<Violation[]> {
  const url = new URL(`${API_BASE}/reports/violations`);
  if (filters.droneId) url.searchParams.append('drone_id', filters.droneId);
  if (filters.date) url.searchParams.append('date', filters.date);
  if (filters.type) url.searchParams.append('type', filters.type);
  
  const res = await authenticatedFetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  // Backend returns { violations: [...], total: number, filters: {...} }
  return data.violations || [];
}

export async function fetchKPIs(filters: Partial<Filters> = {}): Promise<KPIResponse> {
  const url = new URL(`${API_BASE}/reports/kpis`);
  if (filters.droneId) url.searchParams.append('drone_id', filters.droneId);
  if (filters.date) url.searchParams.append('date', filters.date);
  if (filters.type) url.searchParams.append('type', filters.type);
  
  const res = await authenticatedFetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchFilters(): Promise<FilterOptions> {
  const res = await authenticatedFetch(`${API_BASE}/reports/filters`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Export as api object for easier importing
export const api = {
  // Auth
  login,
  register,
  logout,
  getProfile,
  // Data
  uploadReport,
  getViolations: fetchViolations,
  getKPIs: fetchKPIs,
  getFilters: fetchFilters
}; 