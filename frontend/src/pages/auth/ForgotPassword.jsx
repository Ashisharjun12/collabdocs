import React, { useState } from 'react';
import { authApi } from '../../services/api';
import { Mail, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import AuthLayout from './AuthLayout';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await authApi.forgotPassword(email);
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
          quote="The security and recovery features in CollabDocs give us peace of mind when managing sensitive technical documentation."
          author="David Miller, Security Lead at CloudScale"
        >
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-medium text-[#fafafa] tracking-tight">Reset Password</h1>
              <p className="text-[#898989] text-[15px]">Enter your email to receive a recovery link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[11px] font-bold text-[#4d4d4d] uppercase tracking-[1.5px] ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#2e2e2e] group-focus-within:text-[#3ecf8e] transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#0f0f0f] border-[#2e2e2e] focus:border-[#3ecf8e]/40 focus:ring-4 focus:ring-[#3ecf8e]/5 text-[#fafafa] pl-12 py-7 rounded-xl transition-all placeholder:text-[#4d4d4d] text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                  <p className="text-red-500 text-[13px] font-medium">{error}</p>
                </div>
              )}

              {message && (
                <div className="p-4 bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 rounded-xl text-center">
                  <p className="text-[#3ecf8e] text-[13px] font-medium">{message}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3ecf8e] hover:bg-[#00c573] text-[#171717] py-7 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-[0_10px_30px_rgba(62,207,142,0.15)] active:scale-95"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Recovery Link</span>
                  </>
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

export default ForgotPassword;
