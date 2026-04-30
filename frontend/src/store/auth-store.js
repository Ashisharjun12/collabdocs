import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { authApi } from "../services/api";
import { toast } from "sonner";

export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        authUser: null,
        accessToken: null,
        isLoading: false,
        isAuthenticated: false,

        // Signup action
        signup: async (data) => {
          set({ isLoading: true });
          try {
            const response = await authApi.signup(data);
            const { user, accessToken } = response.data.data;
            set({ 
              authUser: user,
              accessToken: accessToken,
              isAuthenticated: true, 
              isLoading: false 
            });
            toast.success("Account created successfully!");
          } catch (error) {
            set({ isLoading: false });
            toast.error(error.response?.data?.message || "Signup failed");
            throw error;
          }
        },

        // Login action
        login: async (data) => {
          set({ isLoading: true });
          try {
            const response = await authApi.login(data);
            const { user, accessToken } = response.data.data;
            set({ 
              authUser: user,
              accessToken: accessToken,
              isAuthenticated: true, 
              isLoading: false 
            });
            toast.success("Welcome back!");
          } catch (error) {
            set({ isLoading: false });
            toast.error(error.response?.data?.message || "Login failed");
            throw error;
          }
        },

        // Google Login redirect
        loginWithGoogle: () => {
          authApi.googleLogin();
        },

        // Logout action
        logout: async () => {
          try {
            await authApi.logout();
          } catch (error) {
            console.error("Logout error", error);
          } finally {
            set({ authUser: null, accessToken: null, isAuthenticated: false });
            toast.success("Logged out successfully");
          }
        },

        // Check authentication on app load
        checkAuth: async () => {
          set({ isLoading: true });
          try {
            const response = await authApi.checkAuth();
            const { user, accessToken } = response.data.data;
            set({ 
              authUser: user,
              accessToken: accessToken,
              isAuthenticated: true, 
              isLoading: false 
            });
          } catch (error) {
            set({ authUser: null, accessToken: null, isAuthenticated: false, isLoading: false });
          }
        },

        // Update user data locally
        setAuthUser: (user, token) => set((state) => ({ 
            authUser: user, 
            accessToken: token || state.accessToken 
        })),
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({ authUser: state.authUser, isAuthenticated: state.isAuthenticated }),
      }
    ),
    { name: "AuthStore" }
  )
);
