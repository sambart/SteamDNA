import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
});

// API functions
// identifier can be Steam ID64, vanity URL name, or profile URL
export const steamApi = {
  getUserData: (identifier: string) => api.get(`/steam/user/${encodeURIComponent(identifier)}`),
  getOwnedGames: (identifier: string) => api.get(`/steam/games/${encodeURIComponent(identifier)}`),
  getPlayerSummary: (identifier: string) => api.get(`/steam/player/${encodeURIComponent(identifier)}`),
};

export const analysisApi = {
  getSummary: (identifier: string) => api.get(`/analysis/summary/${encodeURIComponent(identifier)}`),
  getDashboard: (identifier: string) => api.get(`/analysis/dashboard/${encodeURIComponent(identifier)}`),
};
