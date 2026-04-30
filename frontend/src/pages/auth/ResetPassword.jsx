import React, { useState } from 'react';
import { authApi } from '../../services/api';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Layout, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

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
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4 selection:bg-[#1D9E75]/30">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1D9E75]/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1D9E75]/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md bg-[#13151f]/80 backdrop-blur-xl border border-[#1e2130] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-500">
                {/* Subtle top highlight */}
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#1D9E75] to-transparent opacity-50"></div>
                
                <div className="p-8">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center justify-center gap-3 mb-10">
                        <div className="w-12 h-12 bg-[#1D9E75] rounded-xl flex items-center justify-center shadow-lg shadow-[#1D9E75]/30 group cursor-pointer transition-transform duration-300">
                            <Layout className="text-white w-7 h-7" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Collab<span className="text-[#1D9E75]">Docs</span>
                        </h1>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-xl font-semibold text-white mb-2">Create New Password</h2>
                        <p className="text-slate-400 text-sm">Secure your account with a new password</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400 ml-1">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#1D9E75] transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0f1117] border border-[#2a2d3a] focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]/20 text-white pl-11 pr-11 py-3 rounded-xl outline-none transition-all placeholder:text-slate-600 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#1D9E75] transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#1D9E75] transition-colors" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-[#0f1117] border border-[#2a2d3a] focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]/20 text-white pl-11 pr-11 py-3 rounded-xl outline-none transition-all placeholder:text-slate-600 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#1D9E75] transition-colors cursor-pointer"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center mt-4">
                                <p className="text-red-500 text-xs font-medium">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="p-3 bg-[#1D9E75]/10 border border-[#1D9E75]/30 rounded-xl text-center mt-4">
                                <p className="text-[#1D9E75] text-xs font-medium flex items-center justify-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Password reset successful! redirecting...
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-[#1D9E75] hover:bg-[#168a65] disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-[#1D9E75]/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <span>Reset Password</span>
                            )}
                        </button>

                        <Link to="/login" className="flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mt-6">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Sign In</span>
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
