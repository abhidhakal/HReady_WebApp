import api from '/src/api/api.js';

/**
 * Profile Service (Employee)
 * Handles all profile operations for employees
 */

// Get my profile
export const getMyProfile = async () => {
  try {
    const response = await api.get('/employees/me');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update my profile
export const updateMyProfile = async (profileData) => {
  try {
    const response = await api.put('/employees/me', profileData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Upload profile picture
export const uploadProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await api.put('/employees/me/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/employees/me/change-password', {
      currentPassword,
      newPassword
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get profile statistics
export const getProfileStats = async () => {
  try {
    const response = await api.get('/employees/me/stats');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
}; 