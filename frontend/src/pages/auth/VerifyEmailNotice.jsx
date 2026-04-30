import React from 'react';
import { useAuthStore } from '../../store/auth-store';
import { Mail, Layout, ArrowRight, LogOut, RefreshCw } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

const VerifyEmailNotice = () => {
    const { authUser, logout, checkAuth, isLoading } = useAuthStore();

    if (!authUser) return <Navigate to="/login" replace />;
    if (authUser.email_verified) return <Navigate to="/dashboard" replace />;

    const handleRefresh = async () => {
        try {
            await checkAuth();
            // We use a small timeout to ensure the store state has settled
            setTimeout(() => {
                if (useAuthStore.getState().authUser?.email_verified) {
                    toast.success("Email verified! Redirecting...");
                } else {
                    toast.info("Still not verified. Please check your email or wait a moment.");
                }
            }, 500);
        } catch (err) {
            toast.error("Failed to check status. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4 selection:bg-[#1D9E75]/30">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1D9E75]/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1D9E75]/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md bg-[#13151f]/80 backdrop-blur-xl border border-[#1e2130] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-500">
                {/* Subtle top highlight */}
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#1D9E75] to-transparent opacity-50"></div>
                
                <div className="p-8 text-center">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center justify-center gap-3 mb-10">
                        <div className="w-12 h-12 bg-[#1D9E75] rounded-xl flex items-center justify-center shadow-lg shadow-[#1D9E75]/30">
                            <Layout className="text-white w-7 h-7" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Collab<span className="text-[#1D9E75]">Docs</span>
                        </h1>
                    </div>

                    <div className="w-20 h-20 bg-[#1D9E75]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#1D9E75]/20">
                        <Mail className="text-[#1D9E75] w-10 h-10 animate-pulse" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3">Verify Your Email</h2>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                        We've sent a verification link to <span className="text-white font-medium">{authUser.email}</span>. 
                        Please check your inbox (and spam folder) to activate your account.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="w-full bg-[#1D9E75] hover:bg-[#168a65] disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-[#1D9E75]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isLoading ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>I've verified my email</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <button
                            onClick={logout}
                            className="w-full bg-[#1a1d28] border border-[#2a2d3a] hover:bg-[#232635] text-slate-300 py-3 rounded-xl transition-all font-medium flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign out</span>
                        </button>
                    </div>

                    <p className="mt-8 text-slate-500 text-xs">
                        Can't find the email? Check your spam folder or wait a few minutes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailNotice;
