import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Monitor, 
  Smartphone, 
  Laptop, 
  MapPin, 
  Clock, 
  LogOut,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { authApi } from '../../services/api';
import { toast } from 'sonner';

const SecuritySettings = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await authApi.getSessions();
      setSessions(response.data.data.sessions);
      setCurrentSessionId(response.data.data.currentSessionId);
    } catch (error) {
      toast.error('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (sessionId) => {
    try {
      await authApi.revokeSession(sessionId);
      toast.success('Session revoked successfully');
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  const parseUA = (ua) => {
    if (!ua) return 'Unknown Device';
    const lower = ua.toLowerCase();
    
    // Browser
    let browser = 'Web Browser';
    if (lower.includes('chrome')) browser = 'Chrome';
    else if (lower.includes('firefox')) browser = 'Firefox';
    else if (lower.includes('safari') && !lower.includes('chrome')) browser = 'Safari';
    else if (lower.includes('edge')) browser = 'Edge';
    
    // OS / Device
    let device = 'PC';
    if (lower.includes('iphone')) device = 'iPhone';
    else if (lower.includes('android')) device = 'Android Phone';
    else if (lower.includes('macintosh') || lower.includes('mac os')) device = 'Mac';
    else if (lower.includes('windows')) device = 'Windows PC';
    else if (lower.includes('linux')) device = 'Linux PC';
    
    return `${browser} on ${device}`;
  };

  const getDeviceIcon = (info) => {
    const lower = info?.toLowerCase() || '';
    if (lower.includes('iphone') || lower.includes('android') || lower.includes('mobile')) return Smartphone;
    if (lower.includes('mac') || lower.includes('windows') || lower.includes('linux')) return Laptop;
    return Monitor;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-medium text-[#fafafa] mb-1.5 tracking-tight">Security & Access</h1>
        <p className="text-[#898989] text-sm">Manage your account security and active device sessions.</p>
      </div>

      <div className="grid gap-8">
        {/* Active Sessions Section */}
        <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl overflow-hidden shadow-2xl relative group/card">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3ecf8e]/5 rounded-full blur-[100px] pointer-events-none group-hover/card:bg-[#3ecf8e]/10 transition-colors duration-700"></div>
          
          <div className="p-8 sm:p-10 border-b border-[#2e2e2e] relative z-10">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-8 h-8 bg-[#3ecf8e]/10 rounded-lg flex items-center justify-center text-[#3ecf8e] border border-[#3ecf8e]/20">
                <Shield className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-medium text-[#fafafa] tracking-tight">Active Sessions</h2>
            </div>
            <p className="text-sm text-[#898989] max-w-xl leading-relaxed">
              These devices are currently logged into your account. You can revoke access for any session if you notice any suspicious activity.
            </p>
          </div>

          <div className="divide-y divide-[#2e2e2e] relative z-10">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-[#3ecf8e] animate-spin" />
                <span className="text-[10px] text-[#4d4d4d] font-bold uppercase tracking-widest">Loading sessions</span>
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-[#898989] text-sm">No active sessions found.</p>
              </div>
            ) : (
              sessions.map((session) => {
                const Icon = getDeviceIcon(session.deviceInfo);
                const isCurrent = session.id === currentSessionId;
                
                return (
                  <div key={session.id} className={`p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 transition-all ${isCurrent ? 'bg-[#3ecf8e]/[0.02]' : 'hover:bg-[#242424]/50'}`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isCurrent ? 'bg-[#3ecf8e] text-[#171717] shadow-lg shadow-[#3ecf8e]/20' : 'bg-[#171717] text-[#4d4d4d] border border-[#2e2e2e]'}`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-[15px] font-medium text-[#fafafa] tracking-tight">
                            {parseUA(session.deviceInfo)}
                          </h3>
                          {isCurrent && (
                            <span className="px-2.5 py-0.5 rounded-md bg-[#3ecf8e]/10 text-[#3ecf8e] text-[9px] font-bold uppercase tracking-[1px] border border-[#3ecf8e]/20">
                              Current Device
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                          <div className="flex items-center gap-2 text-[#3ecf8e] font-medium">
                            <MapPin className="w-3.5 h-3.5" />
                            {session.ipAddress || 'Unknown IP'}
                          </div>
                          <div className="flex items-center gap-2 text-[#4d4d4d]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>First seen {new Date(session.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {!isCurrent ? (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRevoke(session.id)}
                        className="text-red-500/80 hover:text-red-500 hover:bg-red-500/5 h-10 px-5 gap-2.5 rounded-lg font-medium text-xs border border-[#2e2e2e] hover:border-red-500/20 transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Revoke Access
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2.5 px-5 py-2.5 bg-[#171717] border border-[#2e2e2e] rounded-lg text-[10px] font-bold text-[#3ecf8e] uppercase tracking-[1.5px] shadow-inner">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e] animate-pulse"></div>
                        Active Now
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Security Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl p-8 shadow-2xl space-y-5 hover:border-[#3ecf8e]/20 transition-all group/security">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover/security:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div className="px-2.5 py-1 rounded-md bg-[#171717] border border-[#2e2e2e] text-[9px] font-bold text-[#4d4d4d] uppercase tracking-[1px]">Recommended</div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[#fafafa] tracking-tight">Two-Factor Auth</h3>
              <p className="text-xs text-[#898989] leading-relaxed">Add an extra layer of security to your account by requiring an additional verification code.</p>
            </div>
            <Button variant="outline" className="w-full bg-[#171717] border-[#2e2e2e] text-[#fafafa] hover:bg-[#242424] h-11 rounded-lg text-xs font-medium cursor-pointer transition-all">
              Configure 2FA
            </Button>
          </div>

          <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl p-8 shadow-2xl space-y-5 hover:border-[#3ecf8e]/20 transition-all group/security">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 group-hover/security:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="px-2.5 py-1 rounded-md bg-[#171717] border border-[#2e2e2e] text-[9px] font-bold text-[#4d4d4d] uppercase tracking-[1px]">Premium</div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[#fafafa] tracking-tight">Advanced Protection</h3>
              <p className="text-xs text-[#898989] leading-relaxed">Enable advanced safeguards for your documents and sensitive workspace data.</p>
            </div>
            <Button variant="outline" className="w-full bg-[#171717] border-[#2e2e2e] text-[#fafafa] hover:bg-[#242424] h-11 rounded-lg text-xs font-medium cursor-pointer transition-all">
              Manage Protection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
