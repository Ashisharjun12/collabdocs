import axios from "axios";

const API_URL = import.meta.VITE_APP_URL ? `${import.meta.VITE_APP_URL}/api/v1` : "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor to handle token expiration/refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If access token expired and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes("/auth/refresh")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  checkAuth: () => api.get("/auth/me"),
  googleLogin: () => {
    window.location.href = `${API_URL}/auth/google`;
  },
  getSessions: () => api.get("/auth/sessions"),
  revokeSession: (sessionId) => api.delete(`/auth/sessions/${sessionId}`),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
};

export const uploadApi = {
  getPresignedUrl: (data) => api.post("/upload/presigned-url", data),
  completeUpload: (data) => api.post("/upload/complete", data),
  initiateMultipart: (data) => api.post("/upload/multipart/initiate", data),
  getMultipartPartUrl: (data) => api.post("/upload/multipart/part-url", data),
  completeMultipart: (data) => api.post("/upload/multipart/complete", data),
  deleteFile: (key) => api.delete(`/upload/file/${key}`),
  getFiles: (page = 1, limit = 20) => api.get(`/upload/files?page=${page}&limit=${limit}`),
};

export const userApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.patch("/users/profile", data),
  deleteAccount: () => api.delete("/users/me"),
  searchUsers: (email) => api.get(`/users/search?email=${email}`),
};

export const workspaceApi = {
  getWorkspaces: () => api.get("/workspace"),
  getWorkspaceById: (id) => api.get(`/workspace/${id}`),
  createWorkspace: (data) => api.post("/workspace", data),
  updateWorkspace: (id, data) => api.patch(`/workspace/${id}`, data),
  deleteWorkspace: (id) => api.delete(`/workspace/${id}`),
  acceptInvite: (token) => api.post(`/workspace/accept-invite/${token}`),
  bulkInvite: (id, invitations) => api.post(`/workspace/${id}/bulk-invite`, { invitations }),
  updateMemberRole: (id, userId, role) => api.patch(`/workspace/${id}/members/${userId}`, { role }),
  removeMember: (id, userId) => api.delete(`/workspace/${id}/members/${userId}`),
};

export const docApi = {
  getDocsByWorkspace: (workspaceId, status = 'active', page = 1, limit = 15) => api.get(`/docs/workspace/${workspaceId}?status=${status}&page=${page}&limit=${limit}`),
  getFavorites: (workspaceId) => api.get(`/docs/favorites/${workspaceId}`),
  getDocById: (id) => api.get(`/docs/${id}`),

  createDoc: (data) => api.post("/docs", data),
  updateDoc: (id, data) => api.patch(`/docs/${id}`, data),
  deleteDoc: (id) => api.delete(`/docs/${id}`),
  getVersions: (id, page = 1, limit = 15) => api.get(`/docs/${id}/versions?page=${page}&limit=${limit}`),
  saveVersion: (id, name) => api.post(`/docs/${id}/versions`, { name }),
  renameVersion: (id, versionId, name) => api.patch(`/docs/${id}/versions/${versionId}`, { name }),
  getFavoriteStatus: (id) => api.get(`/docs/${id}/favorite`),
  toggleFavorite: (id) => api.post(`/docs/${id}/favorite`),
  getChatHistory: (id, limit = 50, cursor = null) => api.get(`/docs/${id}/chat?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`),
  sendChatMessage: (id, content) => api.post(`/docs/${id}/chat`, { content }),
  importFromFile: (data) => api.post("/docs/import", data),
  getPublicDocBySlug: (slug) => api.get(`/docs/public/${slug}`),
  listMembers: (id) => api.get(`/docs/${id}/members`),
  addMember: (id, targetUserId, role) => api.post(`/docs/${id}/members`, { targetUserId, role }),
  removeMember: (id, userId) => api.delete(`/docs/${id}/members/${userId}`),
};