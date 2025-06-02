import axios, { AxiosError } from 'axios';
import {Donation, DonationStatus, FoodType, RoleName} from "../utils/types.ts";



export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
  [key: string]: string | number | undefined;
  status?: DonationStatus | 'all';  // Add this line
}

// Add these near your other interfaces
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page number
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Update the FilterDonationsParams to extend PaginationParams
export interface FilterDonationsParams extends PaginationParams {
  status?: DonationStatus;
  foodType?: FoodType;
  location?: string;
}
// Frontend interfaces matching backend responses
export interface User {
  id: number; // Changed to number to match backend Long
  name: string;
  email: string;
  role: string; // Backend returns string like "ROLE_DONOR"
  location?: string;
}

// Request DTOs matching your backend
export interface DonationRequest {
  title: string;
  description: string;
  quantity: number; // Changed to string to match your frontend
  location: string;
  foodType: FoodType;
  expiryDate: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: RoleName;
  location: string;
}

// Response DTOs matching your backend
export interface LoginResponse {
  token: string;
  userResponse: User;
}

export interface FilterDonationsParams {
  status?: DonationStatus;
  foodType?: FoodType;
  location?: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      // Store the token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return {
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Login API Error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },
  
  register: async (name: string, email: string, password: string, role: string) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
      });

      console.log('Registration response:', response.data);

      // Return consistent format like login
      return {
        user: {
          name: response.data.user.name || response.data.userName,
          email: response.data.user.email,
          role: response.data.user.role
        },
        token: response.data.token || response.data.accessToken
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Registration Error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth');
  },
};

// Donations API endpoints
export const donationsApi = {
  // Get all donations (for both Donor and NGO)
  getAllDonations: async (params: PaginationParams = {}): Promise<PaginatedResponse<Donation>> => {
    try {
      const defaultParams = {
        page: 0,
        size: 10,
        sortBy: 'createdAt',
        direction: 'DESC',
        ...params
      };

      const response = await api.get<PaginatedResponse<Donation>>('/donations', {
        params: defaultParams
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching donations:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // Filter donations with optional parameters
  filterDonations: async (params: FilterDonationsParams = {}): Promise<PaginatedResponse<Donation>> => {
    try {
      const defaultParams = {
        page: 0,
        size: 10,
        sortBy: 'createdAt',
        direction: 'DESC',
        ...params
      };

      // Remove undefined/null values
      const cleanParams = Object.fromEntries(
          Object.entries(defaultParams).filter(([_, value]) => value !== undefined && value !== '')
      );

      const response = await api.get<PaginatedResponse<Donation>>('/donations/filter', {
        params: cleanParams
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error filtering donations:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // Get a specific donation by ID
  getDonationById: async (id: number): Promise<Donation> => {
    try {
      const response = await api.get(`/donations/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error fetching donation ${id}:`, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // Create a new donation (Donor only) - Updated to match backend DonationRequest
  createDonation: async (donationData: DonationRequest): Promise<Donation> => {
    try {
      const response = await api.post('/donations', donationData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error creating donation:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // Update a donation (Donor only)
  updateDonation: async (id: number, donation: Partial<DonationRequest>): Promise<Donation> => {
    try {
      const response = await api.put(`/donations/${id}`, donation);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error updating donation:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // Delete a donation (Donor only)
  deleteDonation: async (id: number): Promise<void> => {
    try {
      await api.delete(`/donations/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error deleting donation ${id}:`, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // Claim a donation (NGO only) - Fixed endpoint path
  claimDonation: async (donationId: number, volunteerId: number): Promise<Donation> => {
    try {
      const response = await api.post(`/donations/${donationId}/claim`, null, {
        params: { volunteerId }
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error claiming donation ${donationId}:`, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // Complete a donation (NGO only) - Fixed endpoint path
  completeDonation: async (donationId: number, volunteerId: number): Promise<Donation> => {
    try {
      const response = await api.post(`/donations/${donationId}/complete`, null, {
        params: { volunteerId }
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error completing donation ${donationId}:`, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // Update donation status (NGO only) - Fixed endpoint path and method
  updateDonationStatus: async (donationId: number, status: DonationStatus): Promise<Donation> => {
    try {
      const response = await api.put(`/donations/${donationId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error updating status for donation ${donationId}:`, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  // Utility function to get the current user's email from the JWT token
  getCurrentUserEmail: (): string => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      const userEmail = payload.sub; // Assuming email is stored in the 'sub' claim
      
      if (!userEmail) {
        throw new Error('User email not found in token');
      }
      
      return userEmail;
    } catch (error) {
      console.error('Error decoding token:', error);
      throw new Error('Invalid token format');
    }
  },

  // Get donations for the currently authenticated user (both Donor and NGO can use this)
  getFilteredDonations: async (params: {
    page: number;
    size: number;
    sortBy: string;
    direction: string;
    status?: string;
    foodType?: string;
    location?: string;
  }) => {
    const queryParams = new URLSearchParams();

    // Add all parameters to the query
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await api.get(`/donations/filter?${queryParams.toString()}`);
    return response.data;
  },

  // Helper function to get current user email from token (since you're using email in JWT)
  getCurrentUserFromToken: (): { email: string } => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      const userEmail = payload.sub || payload.email; // 'sub' is standard for email in JWT
      
      if (!userEmail) {
        throw new Error('User email not found in token');
      }
      
      return { email: userEmail };
    } catch (error) {
      console.error('Error decoding token:', error);
      throw new Error('Invalid token format');
    }
  },
};

// Error handling utility
export const handleApiError = (error: AxiosError, context?: string) => {
  const message = error.response?.data || error.message || 'An unexpected error occurred';
  const status = error.response?.status;
  
  console.error(`API Error${context ? ` in ${context}` : ''}:`, {
    status,
    message,
    url: error.config?.url,
    method: error.config?.method
  });
  
  // Return a user-friendly error message
  if (status === 400) {
    return 'Invalid request. Please check your input.';
  } else if (status === 401) {
    return 'You are not authorized. Please log in again.';
  } else if (status === 403) {
    return 'You do not have permission to perform this action.';
  } else if (status === 404) {
    return 'The requested resource was not found.';
  } else if (status === 500) {
    return 'Server error. Please try again later.';
  } else {
    return typeof message === 'string' ? message : 'An error occurred. Please try again.';
  }
};

export { api };