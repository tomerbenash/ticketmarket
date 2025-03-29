import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const register = (userData) => {
  return api.post('/users/', userData);
};

export const login = (credentials) => {
  return api.post('/users/login', credentials);
};

// User services
export const getCurrentUser = () => {
  return api.get('/users/me');
};

// Ticket services
export const getTickets = () => {
  return api.get('/tickets/');
};

export const getTicket = (id) => {
  return api.get(`/tickets/${id}`);
};

export const createTicket = (ticketData) => {
  return api.post('/tickets/', ticketData);
};

export const buyTicket = (id) => {
 return api.put(`/tickets/${id}/buy`);
};
//export const buyTicket = (id, matchedRequestId = null) => {
 // return api.put(`/tickets/${id}/buy`, { matched_request_id: matchedRequestId });
//};

// Sell listing services
export const createSellListing = (listingData) => {
  return api.post('/sell-listings/', listingData);
};

export const getSellListings = () => {
  return api.get('/sell-listings/');
};

// Buy request services
export const createBuyRequest = (requestData) => {
  return api.post('/buy-requests/', requestData);
};

export const getBuyRequests = () => {
  return api.get('/buy-requests/');
};

export const getMatchingListings = (requestId) => {
  return api.get(`/buy-requests/${requestId}/matches`);
};

// Review services
export const createReview = (reviewData) => {
  return api.post('/reviews/', reviewData);
};

export const getSellerReviews = (sellerId) => {
  return api.get(`/reviews/seller/${sellerId}`);
};

// Add this to your api.js file
export const getUserTickets = (userId) => {
  return api.get(`/tickets/user/${userId}`)
}

// Add this function to your api.js file
export const updateListingStatus = (listingData) => {
  return api.put(`/sell-listings/status`, listingData)
}


export default api;