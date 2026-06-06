import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Response interceptor
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const userApi = {
  getAll: (params) => api.get('/users', { params }),
  getIncharges: () => api.get('/users/incharges'),
  getWorkers: () => api.get('/users/workers'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
};



export const attendanceApi = {
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  getToday: () => api.get('/attendance/today'),
  getReport: (params) => api.get('/attendance/report', { params }),
  getWorkerHistory: (id, params) => api.get(`/attendance/worker/${id}`, { params }),
  bulkMark: (data) => api.post('/attendance/bulk-mark', data),
};

export const leaveApi = {
  getAll: (params) => api.get('/leaves', { params }),
  create: (data) => api.post('/leaves', data),
  approve: (id) => api.put(`/leaves/${id}/approve`),
  reject: (id, reason) => api.put(`/leaves/${id}/reject`, { reason }),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getAttendanceTrends: (params) => api.get('/dashboard/attendance-trends', { params }),

  getCategoryDistribution: () => api.get('/dashboard/category-distribution'),
};

export default api;
