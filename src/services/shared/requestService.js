import api from '/src/api/api.js';

/**
 * Request Service (Shared)
 * Handles all request operations for both admins and employees
 */

// Get all requests (admin) or my requests (employee)
export const getRequests = async (isAdmin = false) => {
  try {
    const endpoint = isAdmin ? '/requests' : '/requests/my';
    const response = await api.get(endpoint);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get my requests (employee)
export const getMyRequests = async () => {
  try {
    const response = await api.get('/requests/my');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get request by ID
export const getRequestById = async (requestId) => {
  try {
    const response = await api.get(`/requests/${requestId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Submit request (employee only)
export const submitRequest = async (requestData) => {
  try {
    const form = new FormData();
    form.append('title', requestData.title);
    form.append('message', requestData.message);
    form.append('type', requestData.type);
    if (requestData.attachment) {
      form.append('attachment', requestData.attachment);
    }

    const response = await api.post('/requests', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Create request (employee only)
export const createRequest = async (formData) => {
  try {
    const response = await api.post('/requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update request status (admin only - matches AdminRequests.jsx)
export const updateRequestStatus = async (requestId, status, adminComment = '') => {
  try {
    const response = await api.put(`/requests/${requestId}/status`, { 
      status, 
      adminComment 
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Delete request (admin only)
export const deleteRequest = async (requestId) => {
  try {
    const response = await api.delete(`/requests/${requestId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get requests by status
export const getRequestsByStatus = async (status, isAdmin = false) => {
  try {
    const endpoint = isAdmin ? '/requests' : '/requests/my';
    const response = await api.get(endpoint, { params: { status } });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get pending requests
export const getPendingRequests = async (isAdmin = false) => {
  return getRequestsByStatus('pending', isAdmin);
};

// Get approved requests
export const getApprovedRequests = async (isAdmin = false) => {
  return getRequestsByStatus('approved', isAdmin);
};

// Get rejected requests
export const getRejectedRequests = async (isAdmin = false) => {
  return getRequestsByStatus('rejected', isAdmin);
};

// Get requests by type
export const getRequestsByType = async (type, isAdmin = false) => {
  try {
    const endpoint = isAdmin ? '/requests' : '/requests/my';
    const response = await api.get(endpoint, { params: { type } });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get request statistics
export const getRequestStats = async (isAdmin = false) => {
  try {
    const endpoint = isAdmin ? '/requests/stats' : '/requests/my/stats';
    const response = await api.get(endpoint);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
}; 