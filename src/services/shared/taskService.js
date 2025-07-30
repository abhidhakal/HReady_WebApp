import api from '/src/api/api.js';

/**
 * Task Service (Shared)
 * Handles all task operations for both admins and employees
 */

// Get all tasks (admin) or my tasks (employee)
export const getTasks = async (isAdmin = false) => {
  try {
    const endpoint = isAdmin ? '/tasks' : '/tasks/my';
    const response = await api.get(endpoint);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get my tasks (employee)
export const getMyTasks = async () => {
  try {
    const response = await api.get('/tasks/my');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get task by ID
export const getTaskById = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Create task (admin only)
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update task (admin only)
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Delete task (admin only)
export const deleteTask = async (taskId) => {
  try {
    const response = await api.delete(`/tasks/${taskId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Assign task to employee (admin only)
export const assignTask = async (taskId, employeeId) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/assign`, { employeeId });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Update task status (employee only)
export const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await api.put(`/tasks/my/${taskId}/status`, { status });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Add task comment
export const addTaskComment = async (taskId, comment) => {
  try {
    const response = await api.post(`/tasks/${taskId}/comments`, { comment });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get task comments
export const getTaskComments = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get tasks by status
export const getTasksByStatus = async (status, isAdmin = false) => {
  try {
    const endpoint = isAdmin ? '/tasks' : '/tasks/my';
    const response = await api.get(endpoint, { params: { status } });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get pending tasks
export const getPendingTasks = async (isAdmin = false) => {
  return getTasksByStatus('pending', isAdmin);
};

// Get completed tasks
export const getCompletedTasks = async (isAdmin = false) => {
  return getTasksByStatus('completed', isAdmin);
};

// Get overdue tasks
export const getOverdueTasks = async (isAdmin = false) => {
  try {
    const endpoint = '/tasks/overdue';
    const response = await api.get(endpoint);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get task statistics
export const getTaskStats = async (isAdmin = false) => {
  try {
    const endpoint = '/tasks/stats';
    const response = await api.get(endpoint);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
}; 