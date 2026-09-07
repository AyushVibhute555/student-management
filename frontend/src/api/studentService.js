// frontend/src/api/studentService.js
import axios from 'axios';

// During local development, Vite runs on 5173 and Flask on 5000.
// When deploying to Render/Vercel later, you can replace this with an environment variable.
const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const studentService = {
    // GET /students with pagination and optional status filter
    getStudents: async (page = 1, limit = 10, status = '') => {
        const params = { page, limit };
        if (status) params.status = status;
        
        const response = await apiClient.get('/students', { params });
        return response.data;
    },

    // GET /students/{id}
    getStudentById: async (id) => {
        const response = await apiClient.get(`/students/${id}`);
        return response.data;
    },

    // POST /students
    createStudent: async (studentData) => {
        const response = await apiClient.post('/students', studentData);
        return response.data;
    },

    // PUT /students/{id}
    updateStudent: async (id, studentData) => {
        const response = await apiClient.put(`/students/${id}`, studentData);
        return response.data;
    },

    // DELETE /students/{id}
    deleteStudent: async (id) => {
        const response = await apiClient.delete(`/students/${id}`);
        return response.data;
    }
};