// Base URL of the Gret API server. Leave VITE_API_URL unset when the website and the
// API run on the same server; set it (e.g. https://gret.onrender.com) when the website
// is hosted separately, such as on Vercel.
const API_BASE = ((import.meta as any).env?.VITE_API_URL || '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
