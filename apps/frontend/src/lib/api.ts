import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const authApi = {
  getProfile: () => api.get('/auth/profile'),
};

export const steamApi = {
  getOwnedGames: (steamId: string) => api.get(`/steam/games/${steamId}`),
  getPlayerSummary: (steamId: string) => api.get(`/steam/player/${steamId}`),
};

export const analysisApi = {
  getSummary: (userId: number) => api.get(`/analysis/summary/${userId}`),
  getDashboard: (userId: number) => api.get(`/analysis/dashboard/${userId}`),
};
