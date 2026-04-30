import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      // Re-verify session with the backend after OAuth redirect
      await checkAuth();
    };
    handleAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-[#1D9E75] animate-spin" />
      <p className="text-slate-400 font-medium">Finalizing secure session...</p>
    </div>
  );
};

export default AuthCallback;
