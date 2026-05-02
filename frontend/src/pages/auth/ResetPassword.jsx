import React, { useState } from 'react';
import { authApi } from '../../services/api';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, CheckCircle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import AuthLayout from './AuthLayout';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        
        if (!token) {
            return setError('Reset token is missing');
        }

        setLoading(true);
        setError('');

        try {
            await authApi.resetPassword({ token, password });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
          quote="Maintaining secure access for our global team is critical, and CollabDocs handles it with enterprise-grade reliability."
          author="Elena Rodriguez, Ops at GlobalStack"
        >
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-medium text-[#fafafa] tracking-tight">New Password</h1>
              <p className="text-[#898989] text-[15px]">Secure your account with a new password.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[11px] font-bold text-[#4d4d4d] uppercase tracking-[1.5px] ml-1">New Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#2e2e2e] group-focus-within:text-[#3ecf8e] transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#0f0f0f] border-[#2e2e2e] focus:border-[#3ecf8e]/40 focus:ring-4 focus:ring-[#3ecf8e]/5 text-[#fafafa] pl-12 pr-12 py-7 rounded-xl transition-all placeholder:text-[#4d4d4d] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4d4d4d] hover:text-[#fafafa] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[11px] font-bold text-[#4d4d4d] uppercase tracking-[1.5px] ml-1">Confirm Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#2e2e2e] group-focus-within:text-[#3ecf8e] transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-[#0f0f0f] border-[#2e2e2e] focus:border-[#3ecf8e]/40 focus:ring-4 focus:ring-[#3ecf8e]/5 text-[#fafafa] pl-12 pr-12 py-7 rounded-xl transition-all placeholder:text-[#4d4d4d] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4d4d4d] hover:text-[#fafafa] transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                  <p className="text-red-500 text-[13px] font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 rounded-xl text-center">
                  <p className="text-[#3ecf8e] text-[13px] font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Password reset successful! redirecting...
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || success}
                className="w-full bg-[#3ecf8e] hover:bg-[#00c573] text-[#171717] py-7 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-[0_10px_30px_rgba(62,207,142,0.15)] active:scale-95"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Reset Password</span>
                )}
              </Button>
            </form>

            <div className="pt-4 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-[#898989] hover:text-[#fafafa] text-[14px] transition-colors group cursor-pointer">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        </AuthLayout>
    );
};

export default ResetPassword;
