import axios from 'axios';

const api = axios.create({
    // Use relative URL → Vite proxy forwards /api/* to localhost:5000
    // This eliminates CORS issues entirely in development.
    // In production, set VITE_API_URL to your deployed backend URL.
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 30000,
    withCredentials: false,
});

// Request interceptor - attach token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
