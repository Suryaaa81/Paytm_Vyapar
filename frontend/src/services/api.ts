import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';
const api = axios.create({ baseURL: API_BASE });

// Attach auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vyapar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials: { email: string; password: string; role?: string }) =>
    api.post('/api/auth/login', credentials),
  getMe: (role: string = 'merchant') =>
    api.get(`/api/auth/me?role=${role}`),
  updateCustomerPreferences: (prefs: { allow_promotions?: boolean; preferred_language?: string }, customerId: number = 1) =>
    api.patch(`/api/auth/customer/preferences?customer_id=${customerId}`, prefs),
};

export const merchantsApi = {
  getAll: () => api.get('/api/merchants'),
  getById: (id: number) => api.get(`/api/merchants/${id}`),
  getDashboard: (id: number) => api.get(`/api/merchants/${id}/dashboard`),
  getDailySummary: (id: number) => api.get(`/api/merchants/${id}/daily-summary`),
  getGrowthInsights: (id: number) => api.get(`/api/merchants/${id}/growth-insights`),
  getImpactMetrics: () => api.get('/api/merchants/metrics/impact'),
  getAuditLogs: (id: number) => api.get(`/api/merchants/${id}/audit-logs`),
  getPilotReport: () => api.get('/api/merchants/metrics/pilot-report'),
};

export const offersApi = {
  getByMerchant: (merchantId: number) => api.get(`/api/offers?merchant_id=${merchantId}`),
  getById: (id: number) => api.get(`/api/offers/${id}`),
  create: (data: any) => api.post('/api/offers', data),
  update: (id: number, data: any) => api.put(`/api/offers/${id}`, data),
  updateStatus: (id: number, status: string) => api.patch(`/api/offers/${id}/status`, { status }),
  toggleStatus: (id: number) => api.patch(`/api/offers/${id}/toggle-status`),
  duplicate: (id: number, data: { bulk_price?: number; minimum_quantity?: number; available_stock?: number; validity_days?: number }) =>
    api.post(`/api/offers/${id}/duplicate`, data),
  adjustStock: (id: number, data: { delta?: number; new_stock?: number }) =>
    api.patch(`/api/offers/${id}/stock`, data),
  delete: (id: number) => api.delete(`/api/offers/${id}`),
};

export const marketplaceApi = {
  getOffers: (params?: any) => api.get('/api/marketplace/offers', { params }),
  getOfferById: (id: number) => api.get(`/api/marketplace/offers/${id}`),
  getCompare: (params?: any) => api.get('/api/marketplace/compare', { params }),
  getFavourites: (customerId: number) => api.get(`/api/marketplace/favourites?customer_id=${customerId}`),
  addFavourite: (data: { customer_id: number; target_type: string; target_id: number }) =>
    api.post('/api/marketplace/favourites', data),
  removeFavourite: (favId: number) => api.delete(`/api/marketplace/favourites/${favId}`),
  repeatBooking: (bookingId: number) => api.post(`/api/marketplace/repeat-booking/${bookingId}`),
  getNotifications: (customerId: number) => api.get(`/api/marketplace/notifications?customer_id=${customerId}`),
};

export const bookingsApi = {
  create: (data: any) => api.post('/api/bookings', data),
  getByMerchant: (merchantId: number) => api.get(`/api/bookings?merchant_id=${merchantId}`),
  getByCustomer: (customerId: number) => api.get(`/api/bookings?customer_id=${customerId}`),
  getById: (id: number) => api.get(`/api/bookings/${id}`),
  updateStatus: (id: number, status: string) => api.patch(`/api/bookings/${id}/status`, { status }),
};

export const loyaltyApi = {
  getCustomers: (merchantId: number, segment?: string) =>
    api.get(`/api/loyalty/customers?merchant_id=${merchantId}${segment ? `&segment=${segment}` : ''}`),
  getAtRisk: (merchantId: number) => api.get(`/api/loyalty/at-risk?merchant_id=${merchantId}`),
  createCampaign: (data: any) => api.post('/api/loyalty/campaign-draft', data),
  updateCampaignStatus: (id: number, status: string) => api.patch(`/api/loyalty/campaign-draft/${id}/status`, { status }),
  getCampaigns: (merchantId: number) => api.get(`/api/loyalty/campaigns?merchant_id=${merchantId}`),
};

export const ledgerApi = {
  transcribe: (data: any) => api.post('/api/ledger/transcribe', data),
  parse: (data: any) => api.post('/api/ledger/parse', data),
  saveTransactions: (data: any) => api.post('/api/ledger/transactions', data),
  getSummary: (merchantId: number) => api.get(`/api/ledger/summary?merchant_id=${merchantId}`),
};

export const invoicesApi = {
  extract: (formData: FormData) => api.post('/api/invoices/extract', formData),
  confirm: (data: any) => api.post('/api/invoices/confirm', data),
};

export const assistantApi = {
  query: (data: any) => api.post('/api/assistant/query', data),
};

export const productsApi = {
  getAll: (category?: string) => api.get('/api/products', { params: category ? { category } : {} }),
  getCategories: () => api.get('/api/products/categories'),
  updateImage: (id: number, image_url: string) => api.patch(`/api/products/${id}/image`, { image_url }),
};

export default api;
