import { create } from "zustand";
import { docApi } from "../services/api";
import { toast } from "sonner";

export const useDocStore = create((set, get) => ({
  documents: [],
  activeDocument: null,
  isLoading: false,
  error: null,
  hasMoreDocs: false,
  docsPage: 1,
  docsStatus: 'active',
  isLoadingMore: false,
  
  // Initialize from localStorage, defaulting to true
  isOfflineEnabled: localStorage.getItem('offlineSupport') !== 'false',

  toggleOfflineSupport: () => {
    const currentState = get().isOfflineEnabled;
    const newState = !currentState;
    localStorage.setItem('offlineSupport', newState);
    set({ isOfflineEnabled: newState });
    if (newState) {
      toast.success("Offline Support Enabled", { description: "Changes will be saved to your device." });
    } else {
      toast.info("Offline Support Disabled", { description: "Local data has been cleared." });
    }
  },

  fetchDocuments: async (workspaceId, status = 'active', page = 1) => {
    if (!workspaceId) return;
    set({ isLoading: page === 1, isLoadingMore: page > 1, error: null, docsStatus: status, docsPage: page });
    try {
      const response = await docApi.getDocsByWorkspace(workspaceId, status, page, 15);
      const { docs, hasMore } = response.data.data;
      
      set((state) => ({ 
        documents: page === 1 ? docs : [...state.documents, ...docs], 
        hasMoreDocs: hasMore,
        isLoading: false,
        isLoadingMore: false
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch documents", 
        isLoading: false,
        isLoadingMore: false
      });
    }
  },

  loadMoreDocs: async (workspaceId) => {
    const { docsStatus, docsPage, hasMoreDocs, isLoadingMore } = get();
    if (!hasMoreDocs || isLoadingMore) return;
    await get().fetchDocuments(workspaceId, docsStatus, docsPage + 1);
  },

  createDocument: async (workspaceId, data = {}) => {
    set({ isLoading: true });
    try {
      const response = await docApi.createDoc({ ...data, workspaceId });
      // Backend returns { status: "success", data: { doc: {} } }
      const newDoc = response.data.data.doc;
      set((state) => ({
        documents: [newDoc, ...state.documents],
        activeDocument: newDoc, // Set as active immediately
        isLoading: false,
      }));
      toast.success("Document created successfully");
      return newDoc;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to create document");
      throw error;
    }
  },

  updateDocument: async (docId, data) => {
    set({ isLoading: true });
    try {
      const response = await docApi.updateDoc(docId, data);
      const updatedDoc = response.data.data.doc;
      set((state) => ({
        documents: state.documents.map((doc) => (doc.id === docId ? updatedDoc : doc)),
        activeDocument: state.activeDocument?.id === docId ? updatedDoc : state.activeDocument,
        isLoading: false,
      }));
      return updatedDoc;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to update document");
      throw error;
    }
  },

  deleteDocument: async (docId) => {
    set({ isLoading: true });
    try {
      await docApi.deleteDoc(docId);
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== docId),
        activeDocument: state.activeDocument?.id === docId ? null : state.activeDocument,
        isLoading: false,
      }));
      toast.success("Document deleted");
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to delete document");
    }
  },

  setActiveDocument: (doc) => set({ activeDocument: doc }),
  clearDocuments: () => set({ documents: [], activeDocument: null, error: null }),

  starredDocuments: [],
  fetchFavorites: async (workspaceId) => {
    if (!workspaceId) return;
    try {
      const response = await docApi.getFavorites(workspaceId);
      set({ starredDocuments: response.data.data.docs });
    } catch (error) {
      console.error("Failed to fetch favorites", error);
    }
  },
}));

