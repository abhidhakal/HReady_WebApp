import api from '/src/api/api.js';

/**
 * Announcement Service (Shared)
 * Handles all announcement operations for both admins and employees
 */

// Get all announcements (for employees)
export const getAnnouncements = async (filters = {}) => {
  try {
    const response = await api.get('/announcements', { params: filters });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get announcement by ID
export const getAnnouncementById = async (announcementId) => {
  try {
    const response = await api.get(`/announcements/${announcementId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Create announcement (admin only)
export const createAnnouncement = async (announcementData) => {
  try {
    const response = await api.post('/announcements', announcementData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update announcement (admin only)
export const updateAnnouncement = async (announcementId, announcementData) => {
  try {
    const response = await api.put(`/announcements/${announcementId}`, announcementData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Delete announcement (admin only)
export const deleteAnnouncement = async (announcementId) => {
  try {
    const response = await api.delete(`/announcements/${announcementId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get recent announcements
export const getRecentAnnouncements = async (limit = 5) => {
  try {
    const response = await api.get('/announcements', { 
      params: { limit, sort: '-createdAt' }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get announcements by audience
export const getAnnouncementsByAudience = async (audience) => {
  try {
    const response = await api.get('/announcements', { 
      params: { audience }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Mark announcement as read (employee only)
export const markAnnouncementAsRead = async (announcementId) => {
  try {
    const response = await api.patch(`/announcements/${announcementId}/read`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get unread announcements count
export const getUnreadAnnouncementsCount = async () => {
  try {
    const response = await api.get('/announcements/unread/count');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
}; 