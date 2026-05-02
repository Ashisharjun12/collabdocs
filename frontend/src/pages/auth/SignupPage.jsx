import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth-store';
import { Mail, Lock, User, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import AuthLayout from './AuthLayout';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const { signup, loginWithGoogle, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      const { toast } = await import('sonner');
      return toast.error("Passwords do not match");
    }

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      navigate('/verify-email');
    } catch (err) {
      // Error handled by store toast
    }
  };

  return (
    <AuthLayout 
      quote="Setting up CollabDocs took less than 2 minutes, and the multiplayer experience is the best I've seen in the industry."
      author="Marcus Thorne, CTO at Vector"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-medium text-[#fafafa] tracking-tight">Create your account</h1>
          <p className="text-[#898989] text-[15px]">Join 10,000+ developers building together.</p>
        </div>

        {/* Social Actions */}
        <div className="grid gap-3">
          <Button
            variant="outline"
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-[#1c1c1c] border-[#2e2e2e] hover:bg-[#2e2e2e] text-[#fafafa] py-6 rounded-xl transition-all duration-300 font-medium group cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#242424]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#111218] px-4 text-[#4d4d4d] font-bold tracking-[1.5px]">OR</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[11px] font-bold text-[#4d4d4d] uppercase tracking-[1.5px] ml-1">Full Name</Label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#2e2e2e] group-focus-within:text-[#3ecf8e] transition-colors" />
              <Input
                id="name"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="bg-[#0f0f0f] border-[#2e2e2e] focus:border-[#3ecf8e]/40 focus:ring-4 focus:ring-[#3ecf8e]/5 text-[#fafafa] pl-12 py-6 rounded-xl transition-all placeholder:text-[#4d4d4d] text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[11px] font-bold text-[#4d4d4d] uppercase tracking-[1.5px] ml-1">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#2e2e2e] group-focus-within:text-[#3ecf8e] transition-colors" />
              <Input
                id="email"
                type="email"
                required
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                className="bg-[#0f0f0f] border-[#2e2e2e] focus:border-[#3ecf8e]/40 focus:ring-4 focus:ring-[#3ecf8e]/5 text-[#fafafa] pl-12 py-6 rounded-xl transition-all placeholder:text-[#4d4d4d] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-2">
               <Label htmlFor="password" className="text-[11px] font-bold text-[#4d4d4d] uppercase tracking-[1.5px] ml-1">Password</Label>
               <Input
                 id="password"
                 type={showPassword ? "text" : "password"}
                 required
                 placeholder="••••••••"
                 value={formData.password}
                 onChange={handleChange}
                 className="bg-[#0f0f0f] border-[#2e2e2e] focus:border-[#3ecf8e]/40 focus:ring-4 focus:ring-[#3ecf8e]/5 text-[#fafafa] px-4 py-6 rounded-xl transition-all placeholder:text-[#4d4d4d] text-sm"
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="confirmPassword" className="text-[11px] font-bold text-[#4d4d4d] uppercase tracking-[1.5px] ml-1">Confirm</Label>
               <Input
                 id="confirmPassword"
                 type={showPassword ? "text" : "password"}
                 required
                 placeholder="••••••••"
                 value={formData.confirmPassword}
                 onChange={handleChange}
                 className="bg-[#0f0f0f] border-[#2e2e2e] focus:border-[#3ecf8e]/40 focus:ring-4 focus:ring-[#3ecf8e]/5 text-[#fafafa] px-4 py-6 rounded-xl transition-all placeholder:text-[#4d4d4d] text-sm"
               />
             </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#3ecf8e] hover:bg-[#00c573] text-[#171717] py-7 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-[0_10px_30px_rgba(62,207,142,0.15)] active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </Button>
        </form>

        <p className="text-[#4d4d4d] text-[13px] text-center pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-[#fafafa] hover:text-[#3ecf8e] font-medium transition-colors cursor-pointer ml-1">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
