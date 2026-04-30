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
  CheckCircle2
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Security & Access</h1>
        <p className="text-slate-500 text-sm">Manage your account security and active sessions.</p>
      </div>

      <div className="grid gap-8">
        {/* Active Sessions Section */}
        <div className="bg-[#13151f] border border-[#1e2130] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 sm:p-8 border-b border-[#1e2130]">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-[#1D9E75]" />
              <h2 className="text-lg font-semibold text-white">Active Sessions</h2>
            </div>
            <p className="text-sm text-slate-500">These devices are currently logged into your account. You can revoke access for any device at any time.</p>
          </div>

          <div className="divide-y divide-[#1e2130]">
            {loading ? (
              <div className="p-12 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-500">No active sessions found.</p>
              </div>
            ) : (
              sessions.map((session) => {
                const Icon = getDeviceIcon(session.deviceInfo);
                const isCurrent = session.id === currentSessionId;
                
                return (
                  <div key={session.id} className={`p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors ${isCurrent ? 'bg-[#1D9E75]/5' : 'hover:bg-[#0f1117]/50'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isCurrent ? 'bg-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/20' : 'bg-[#1D9E75]/10 text-[#1D9E75]'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">
                            {parseUA(session.deviceInfo)}
                          </h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-[#1D9E75]/20 text-[#1D9E75] text-[10px] font-bold uppercase tracking-wider">
                              Current Device
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                          <div className="flex items-center gap-1.5 font-medium text-[#1D9E75]">
                            <MapPin className="w-3.5 h-3.5" />
                            {session.ipAddress || 'Unknown IP'}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            Active {new Date(session.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {!isCurrent ? (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRevoke(session.id)}
                        className="text-red-400 hover:text-white hover:bg-red-400/10 h-10 px-4 gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Revoke Access
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#0f1117] border border-[#1e2130] rounded-xl text-[11px] font-bold text-[#1D9E75] uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#13151f] border border-[#1e2130] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Two-Factor Auth</h3>
            </div>
            <p className="text-xs text-slate-500">Add an extra layer of security to your account by requiring more than just a password to log in.</p>
            <Button variant="outline" className="w-full border-[#1e2130] text-slate-400 hover:text-white hover:bg-[#1a1d28]">
              Configure 2FA
            </Button>
          </div>

          <div className="bg-[#13151f] border border-[#1e2130] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Advanced Security</h3>
            </div>
            <p className="text-xs text-slate-500">Enable advanced protection for your documents and sensitive data within the workspace.</p>
            <Button variant="outline" className="w-full border-[#1e2130] text-slate-400 hover:text-white hover:bg-[#1a1d28]">
              Manage Protection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
