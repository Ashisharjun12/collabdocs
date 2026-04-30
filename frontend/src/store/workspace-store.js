import { create } from "zustand";
import { workspaceApi } from "../services/api";
import { toast } from "sonner";

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await workspaceApi.getWorkspaces();
      const workspaces = response.data.data.workspaces;
      set({ 
        workspaces, 
        isLoading: false,
        // Set first workspace as active by default if none selected
        activeWorkspace: get().activeWorkspace || workspaces[0] || null
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch workspaces", 
        isLoading: false 
      });
    }
  },

  fetchWorkspaceDetails: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workspaceApi.getWorkspaceById(id);
      const workspace = response.data.data.workspace;
      set((state) => ({
        workspaces: state.workspaces.map((ws) => ws.id === id ? workspace : ws),
        activeWorkspace: state.activeWorkspace?.id === id ? workspace : state.activeWorkspace,
        isLoading: false,
      }));
      return workspace;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch workspace details", 
        isLoading: false 
      });
      throw error;
    }
  },

  setActiveWorkspace: (workspace) => {
    set({ activeWorkspace: workspace });
  },

  createWorkspace: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workspaceApi.createWorkspace(data);
      const newWorkspace = response.data.data.workspace;
      set((state) => ({
        workspaces: [...state.workspaces, newWorkspace],
        activeWorkspace: newWorkspace,
        isLoading: false,
      }));
      return newWorkspace;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to create workspace", 
        isLoading: false 
      });
      throw error;
    }
  },

  acceptInvite: async (token) => {
    set({ isLoading: true, error: null });
    try {
      await workspaceApi.acceptInvite(token);
      await get().fetchWorkspaces();
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to accept invitation", 
        isLoading: false 
      });
      throw error;
    }
  },

  updateWorkspace: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workspaceApi.updateWorkspace(id, data);
      const updatedWorkspace = response.data.data.workspace;
      set((state) => ({
        workspaces: state.workspaces.map((ws) => ws.id === id ? updatedWorkspace : ws),
        activeWorkspace: state.activeWorkspace?.id === id ? updatedWorkspace : state.activeWorkspace,
        isLoading: false,
      }));
      return updatedWorkspace;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to update workspace", 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteWorkspace: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await workspaceApi.deleteWorkspace(id);
      set((state) => {
        const remainingWorkspaces = state.workspaces.filter((ws) => ws.id !== id);
        return {
          workspaces: remainingWorkspaces,
          activeWorkspace: state.activeWorkspace?.id === id ? (remainingWorkspaces[0] || null) : state.activeWorkspace,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to delete workspace", 
        isLoading: false 
      });
      throw error;
    }
  },

  updateMemberRole: async (workspaceId, userId, role) => {
    try {
      await workspaceApi.updateMemberRole(workspaceId, userId, role);
      // Refresh details to get updated members list
      await get().fetchWorkspaceDetails(workspaceId);
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update member role");
      throw error;
    }
  },

  removeMember: async (workspaceId, userId) => {
    try {
      await workspaceApi.removeMember(workspaceId, userId);
      // Refresh details to get updated members list
      await get().fetchWorkspaceDetails(workspaceId);
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
      throw error;
    }
  },
}));
