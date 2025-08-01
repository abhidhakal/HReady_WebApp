import api from '/src/api/api.js';

/**
 * Admin Profile Service
 * Handles all admin profile operations
 */

// Get admin profile
export const getAdminProfile = async () => {
  try {
    const response = await api.get('/admins/me');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update admin profile
export const updateAdminProfile = async (profileData) => {
  try {
    const response = await api.put('/admins/me', profileData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Upload admin profile picture
export const uploadAdminProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await api.put('/admins/upload-profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Change admin password
export const changeAdminPassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/admins/change-password', {
      currentPassword,
      newPassword
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Delete admin account
export const deleteAdminAccount = async () => {
  try {
    const response = await api.delete('/admins/me');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
}; 