import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { AxiosRequestConfig as AxiosRequestConfigType } from "axios";
import { AxiosResponse, AxiosError, isAxiosError } from 'axios';

const baseURL = "http://localhost:8080"

const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem("token")
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Sending request with token:', token);
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export const authService = {
  register: async (data: any) => {
    const response = await api.post("/auth/register", data)
    return response.data
  },
  login: async (data: any) => {
    const response = await api.post("/auth/login", data)
    return response.data
  },
  isAuthenticated: async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return false
      
      const response = await api.get("/auth/verify")
      return response.status === 200
    } catch (error) {
      console.error("Error verifying auth status:", error);
      return false;
    }
  },
  isAdmin: async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return false
      
      const response = await api.get("/auth/admin-verify")
      return response.status === 200
    } catch (error) {
      console.error("Error verifying admin status:", error);
      return false;
    }
  },
}

export const userService = {
  getStudentProfile: (id: string) => api.get(`/users/students/${id}`),
  getCompanyProfile: (id: string) => api.get(`/users/companies/${id}`),
  updateStudentProfile: (id: string, data: any) => api.put(`/users/students/${id}`, data),
  updateCompanyProfile: (id: string, data: any) => api.put(`/users/companies/${id}`, data),
}

export const offerService = {
  getAllOffers: (params?: Record<string, string>) => api.get("/offers", params ? { params } as AxiosRequestConfigType : undefined),
  getOfferById: (id: string) => api.get(`/offers/${id}`),
  createOffer: (data: any) => api.post("/offers", data),
  updateOffer: (id: string, data: any) => api.put(`/offers/${id}`, data),
  deleteOffer: (id: string) => api.delete(`/offers/${id}`),
  getAllOfferscompany: (companyId: string, params?: Record<string, string>) => api.get(`/offers/company/${companyId}`, params ? { params } as AxiosRequestConfigType : undefined),
}

export const applicationService = {
  getStudentApplications: (studentId: string) => api.get(`/applications/students/${studentId}`),
  getOfferApplications: (offerId: string) => api.get(`/applications/offers/${offerId}`),
  createApplication: (data: any) => api.post("/applications", data),
  updateApplicationStatus: (id: string, status: string) => api.put(`/applications/${id}/status`, null, { params: { status } }),
  getApplicationById: (id: string) => api.get(`/applications/${id}`),
}

export const contractService = {
  getContract: (id: string) => api.get(`/contracts/${id}`),
  createContract: (data: any) => api.post("/contracts", data),
}

// Internship services
export const internshipService = {
  getAllInternships: async (filters?: Record<string, string>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return await api.get(`/internships?${params.toString()}`);
  },
  
  getInternshipById: async (id: string) => {
    return await api.get(`/internships/${id}`);
  },
  
  createInternship: async (internshipData: any) => {
    return await api.post('/internships', internshipData);
  },
  
  updateInternship: async (id: string, internshipData: any) => {
    return await api.put(`/internships/${id}`, internshipData);
  },
  
  deleteInternship: async (id: string) => {
    return await api.delete(`/internships/${id}`);
  }
};

// User profile services
export const userProfileService = {
  getUserProfile: async () => {
    return await api.get('/users/profile');
  },
  
  updateUserProfile: async (profileData: any) => {
    return await api.put('/users/profile', profileData);
  },
  
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/users/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// Dashboard statistics for admin
export const dashboardService = {
  getStatistics: async () => {
    return await api.get('/admin/statistics');
  },
  
  getRecentApplications: async () => {
    return await api.get('/admin/recent-applications');
  },
  
  getInternshipStats: async () => {
    return await api.get('/admin/internship-stats');
  }
};

// Dashboard statistics for company
export const companyDashboardService = {
  getDashboardStats: () => api.get('/dashboard/company/stats'),
}

export const jobService = {
  getRecommendedJobs: async () => {
    try {
      const response = await api.get('/offers');
      console.log('API Response:', response);
      // Ensure we're returning the data array from the response
      return Array.isArray(response.data) ? response.data : response.data.offers || [];
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
      throw error;
    }
  },
};

export default api; 