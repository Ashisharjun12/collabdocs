import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth-store';
import { User, Mail, Lock, UserPlus, Layout, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { signup, loginWithGoogle, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (err) {
      // Error handled by store
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4 selection:bg-[#1D9E75]/30">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1D9E75]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1D9E75]/5 rounded-full blur-[120px]"></div>
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
            <h2 className="text-xl font-semibold text-white mb-2">Create Account</h2>
            <p className="text-slate-400 text-sm">Join the future of collaborative writing</p>
          </div>

          {/* Social Login */}
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-[#1a1d28] border border-[#2a2d3a] hover:bg-[#232635] hover:border-[#1D9E75]/30 text-slate-200 py-3 rounded-xl transition-all duration-300 font-medium group cursor-pointer"
          >
            <svg className="w-5 h-5 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="group-hover:text-white transition-colors">Sign up with Google</span>
          </button>

          <div className="flex items-center gap-4 my-8">
            <div className="h-[1px] bg-[#1e2130] flex-1"></div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">or register with details</span>
            <div className="h-[1px] bg-[#1e2130] flex-1"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#1D9E75] transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0f1117] border border-[#2a2d3a] focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]/20 text-white pl-11 pr-4 py-3 rounded-xl outline-none transition-all placeholder:text-slate-600 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#1D9E75] transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0f1117] border border-[#2a2d3a] focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]/20 text-white pl-11 pr-4 py-3 rounded-xl outline-none transition-all placeholder:text-slate-600 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#1D9E75] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1D9E75] hover:bg-[#168a65] disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-[#1D9E75]/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1D9E75] hover:text-[#168a65] font-semibold transition-colors cursor-pointer">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
