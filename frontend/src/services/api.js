import axios from 'axios';

// In dev, '/api' hits the Vite proxy (see vite.config.js) which forwards to
// localhost:5000. In production the frontend and backend are on different
// domains (e.g. Netlify + Render), so VITE_API_URL must point at the full
// backend URL, e.g. https://your-backend.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

// Attach the JWT to every outgoing request, if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error messages so components can just read err.message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;