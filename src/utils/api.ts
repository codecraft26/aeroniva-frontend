import { Report, Violation, KPIResponse, FilterOptions, Filters } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://backend.otito.in/api';

export async function uploadReport(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('report', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchViolations(filters: Partial<Filters> = {}): Promise<Violation[]> {
  const url = new URL(`${API_BASE}/violations`);
  if (filters.droneId) url.searchParams.append('drone_id', filters.droneId);
  if (filters.date) url.searchParams.append('date', filters.date);
  if (filters.type) url.searchParams.append('type', filters.type);
  
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchKPIs(filters: Partial<Filters> = {}): Promise<KPIResponse> {
  const url = new URL(`${API_BASE}/kpis`);
  if (filters.droneId) url.searchParams.append('drone_id', filters.droneId);
  if (filters.date) url.searchParams.append('date', filters.date);
  if (filters.type) url.searchParams.append('type', filters.type);
  
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchFilters(): Promise<FilterOptions> {
  const res = await fetch(`${API_BASE}/filters`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Export as api object for easier importing
export const api = {
  uploadReport,
  getViolations: fetchViolations,
  getKPIs: fetchKPIs,
  getFilters: fetchFilters
}; 