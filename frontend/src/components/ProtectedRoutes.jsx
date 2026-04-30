import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";

export const ProtectedRoutes = () => {
  const { authUser, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // If authenticated but email is not verified, redirect to verification notice
  if (authUser && !authUser.email_verified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
};

export const AdminRoutes = () => {
  const { authUser, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;

  const isAdmin = authUser?.role === "admin" || authUser?.role === "super_admin";

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export const PublicRoutes = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;

  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};
