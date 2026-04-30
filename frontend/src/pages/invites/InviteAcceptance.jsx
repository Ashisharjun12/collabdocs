import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspace-store';
import { useAuthStore } from '../../store/auth-store';
import { Button } from '../../components/ui/button';
import { Loader2, Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const InviteAcceptance = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { acceptInvite, isLoading: isAccepting } = useWorkspaceStore();
  const { authUser, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  const [status, setStatus] = useState('checking'); // checking, ready, success, error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Wait for auth to finish loading
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      toast.error("Please login to accept the invitation");
      navigate(`/login?redirect=/invite/${token}`);
      return;
    }

    // If authenticated, we are ready to show the join button
    setStatus('ready');
  }, [isAuthenticated, isAuthLoading, token, navigate]);

  const handleJoin = async () => {
    try {
      await acceptInvite(token);
      setStatus('success');
      toast.success("Joined workspace successfully! 🚀");

      // Short delay before redirecting to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || "Failed to join workspace. The invite might be expired or invalid.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f18] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs for premium feel */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1D9E75]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#13151f] border border-[#1e2130] rounded-[32px] p-8 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">

          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75]">
              {status === 'success' ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : status === 'error' ? (
                <AlertCircle className="w-10 h-10 text-red-400" />
              ) : (
                <Mail className="w-10 h-10" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {status === 'checking' && "Verifying invitation..."}
              {status === 'ready' && "You're invited!"}
              {status === 'success' && "Welcome aboard!"}
              {status === 'error' && "Invitation Error"}
            </h1>
            <p className="text-slate-400 text-sm">
              {status === 'checking' && "Checking your credentials and invitation token."}
              {status === 'ready' && "You have been invited to collaborate on a workspace."}
              {status === 'success' && "You are now a member. Redirecting you to your dashboard..."}
              {status === 'error' && (errorMsg || "Something went wrong with your invitation.")}
            </p>
          </div>

          <div className="pt-4">
            {status === 'ready' && (
              <Button
                onClick={handleJoin}
                disabled={isAccepting}
                className="w-full bg-[#1D9E75] hover:bg-[#168a65] text-white h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-[#1D9E75]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isAccepting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>Join Workspace <ArrowRight className="w-5 h-5" /></>
                )}
              </Button>
            )}

            {status === 'error' && (
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full bg-transparent border-2 border-[#1e2130] text-slate-300 hover:text-white hover:bg-white/5 h-14 rounded-2xl font-bold text-lg"
              >
                Go to Dashboard
              </Button>
            )}

            {status === 'success' && (
              <div className="flex items-center justify-center gap-2 text-[#1D9E75] font-bold animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin" />
                Setting up your workspace...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteAcceptance;
