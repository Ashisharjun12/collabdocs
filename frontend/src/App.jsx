import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth-store';
import { useWorkspaceStore } from './store/workspace-store';
import { Toaster } from 'sonner';

// Pages

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmailNotice from './pages/auth/VerifyEmailNotice';
import AuthCallback from './pages/auth/AuthCallback';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import WorkspaceHome from './pages/workspace/WorkspaceHome';
import WorkspaceMembers from './pages/workspace/WorkspaceMembers';
import WorkspaceSettings from './pages/workspace/WorkspaceSettings';


import SettingsLayout from './pages/settings/SettingsLayout';
import ProfileSettings from './pages/settings/ProfileSettings';
import NotificationSettings from './pages/settings/NotificationSettings';
import AppearanceSettings from './pages/settings/AppearanceSettings';
import BillingSettings from './pages/settings/BillingSettings';
import SecuritySettings from './pages/settings/SecuritySettings';

import InviteAcceptance from './pages/invites/InviteAcceptance';
import EditorLayout from './pages/editor/EditorLayout';
import EditorPage from './pages/editor/EditorPage';
import PublicEditorPage from './pages/editor/PublicEditorPage';
import LandingPage from './pages/landing/LandingPage';


// Components
import { ProtectedRoutes, PublicRoutes, AdminRoutes } from './components/ProtectedRoutes';
import { Loader2 } from 'lucide-react';

const DashboardRedirect = () => {
  const { workspaces, isLoading } = useWorkspaceStore();

  if (isLoading) {
    return (
      <div className="flex items-center h-full justify-center bg-[#0f1117]">
        <Loader2 className="w-10 h-10 text-[#1D9E75] animate-spin" />
      </div>
    );
  }

  if (workspaces.length > 0) {
    return <Navigate to={`/dashboard/workspace/${workspaces[0].slug}`} replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center px-4">
      <h2 className="text-2xl font-bold mb-2">No Workspace Found</h2>
      <p className="text-slate-500 max-w-md">
        It seems you don't have any workspaces yet.
        Please wait a moment or create one from the sidebar.
      </p>
    </div>
  );
};

const App = () => {
  const { checkAuth, isLoading, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const { fetchWorkspaces } = useWorkspaceStore();

  useEffect(() => {
    if (authUser) {
      fetchWorkspaces();
    }
  }, [authUser, fetchWorkspaces]);

  if (isLoading) {
    return (
      <div className="flex items-center h-screen justify-center bg-[#0f1117]">
        <Loader2 className="w-10 h-10 text-[#1D9E75] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <Routes>
        {/* Public Routes - Accessible only when logged out */}
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Auth Callback - Handles Google OAuth redirect */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Verification Notice - Semi-protected */}
        <Route path="/verify-email" element={<VerifyEmailNotice />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardRedirect />} />
            <Route path="workspace/:slug">
              <Route index element={<WorkspaceHome />} />
              <Route path="shared" element={<div className="p-8 text-slate-500 italic">Shared with me - Coming Soon</div>} />
              <Route path="starred" element={<WorkspaceHome view="starred" />} />
              <Route path="trash" element={<div className="p-8 text-slate-500 italic">Trash - Coming Soon</div>} />

              <Route path="members" element={<WorkspaceMembers />} />
              <Route path="settings" element={<WorkspaceSettings />} />


            </Route>
            <Route path="shared" element={<Navigate to="/dashboard" replace />} />
            <Route path="starred" element={<Navigate to="/dashboard" replace />} />
            <Route path="trash" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Full Screen Editor Route - OUTSIDE DashboardLayout */}
          <Route path="/dashboard/workspace/:slug/doc/:docId" element={<EditorLayout />}>
            <Route index element={<EditorPage />} />
          </Route>
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="/settings/profile" replace />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="appearance" element={<AppearanceSettings />} />
            <Route path="billing" element={<BillingSettings />} />

          </Route>
          <Route path="/profile" element={<div className="p-8"><h1>User Profile</h1></div>} />
          <Route path="/invite/:token" element={<InviteAcceptance />} />
        </Route>

        {/* Admin Specific Routes */}
        <Route element={<AdminRoutes />}>
          <Route path="/admin" element={<div className="p-8"><h1>Admin Panel</h1></div>} />
        </Route>

        {/* Publically Accessible Shared Documents */}
        <Route path="/p/:slug" element={<PublicEditorPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
      <Toaster position="top-center" richColors theme="dark" />
    </div>
  );
};

export default App;