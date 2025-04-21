import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://furniture-e-commerce-wt2i.onrender.com'
    : process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

// Tạo instance axios với base URL
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const UPLOAD_URL = `${API_BASE_URL}/api/admin/upload`;

export default api; 