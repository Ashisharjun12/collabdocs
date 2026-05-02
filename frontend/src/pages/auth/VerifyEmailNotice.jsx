import React from 'react';
import { useAuthStore } from '../../store/auth-store';
import { Mail, ArrowRight, LogOut, RefreshCw, Loader2 } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import AuthLayout from './AuthLayout';

const VerifyEmailNotice = () => {
    const { authUser, logout, checkAuth, isLoading } = useAuthStore();
    const navigate = useNavigate();

    if (!authUser) return <Navigate to="/login" replace />;
    if (authUser.email_verified) return <Navigate to="/dashboard" replace />;

    const handleRefresh = async () => {
        try {
            await checkAuth();
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
        <AuthLayout
          quote="We take security seriously. Verifying your identity ensures your collaborative workspace remains private and protected."
          author="CollabDocs Security Team"
        >
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-2">
              <h1 className="text-3xl font-medium text-[#fafafa] tracking-tight mx-auto lg:mx-0">Verify Your Email</h1>
              <p className="text-[#898989] text-[15px]">Check your inbox to activate your account.</p>
            </div>

            <div className="w-24 h-24 bg-[#3ecf8e]/10 rounded-3xl flex items-center justify-center mx-auto lg:mx-0 mb-8 border border-[#3ecf8e]/20 group transition-all duration-500 hover:border-[#3ecf8e]/40">
              <Mail className="text-[#3ecf8e] w-10 h-10 animate-pulse group-hover:scale-110 transition-transform" />
            </div>

            <div className="space-y-6">
              <p className="text-[#898989] text-[14px] leading-relaxed max-w-md mx-auto lg:mx-0">
                We've sent a verification link to <span className="text-[#fafafa] font-medium">{authUser.email}</span>. 
                Please check your inbox (and spam folder) to activate your account.
              </p>

              <div className="flex flex-col gap-3">
                <Button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="w-full bg-[#3ecf8e] hover:bg-[#00c573] text-[#171717] py-7 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_10px_30px_rgba(62,207,142,0.15)] active:scale-95"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <span>I've verified my email</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    onClick={logout}
                    className="w-full bg-transparent border-[#2e2e2e] hover:bg-[#2e2e2e] text-[#898989] hover:text-[#fafafa] py-6 rounded-xl transition-all font-medium flex items-center justify-center gap-2 cursor-pointer"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                </Button>
              </div>
            </div>

            <div className="pt-8 border-t border-[#2e2e2e]/30">
               <p className="text-[11px] text-[#4d4d4d] uppercase tracking-[1.5px] leading-relaxed">
                 Can't find the email? Check your spam folder or wait a few minutes.
               </p>
            </div>
          </div>
        </AuthLayout>
    );
};

export default VerifyEmailNotice;
