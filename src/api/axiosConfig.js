import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://passman-anpv.onrender.com';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export default axiosInstance;
