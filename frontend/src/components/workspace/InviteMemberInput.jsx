import React, { useState, useEffect } from 'react';
import { Search, Loader2, Plus, UserCircle, ArrowRight } from 'lucide-react';

import { Input } from '../ui/input';
import { userApi } from '../../services/api';
import { Button } from '../ui/button';

const InviteMemberInput = ({ value, onChange, onUserSelect, disabled }) => {
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState(null);

  const handleSearch = async (email) => {
    if (!email || !email.includes('@')) {
      setFoundUser(null);
      return;
    }

    setSearching(true);
    try {

      const response = await userApi.searchUsers(email);
      const users = response.data.data.users;
      setFoundUser(users && users.length > 0 ? users[0] : null);
    } catch (error) {
      setFoundUser(null);
    } finally {
      setSearching(false);
    }

  };

  useEffect(() => {
    // If it looks like a full email, search immediately
    if (value.includes('@') && value.split('@')[1].includes('.')) {
      handleSearch(value);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(value);
    }, 600);

    return () => clearTimeout(timer);
  }, [value]);


  const handleInvite = () => {
    if (!value.trim() || !value.includes('@')) return;

    if (foundUser) {
      onUserSelect(foundUser);
    } else {
      // Add as pending email invite
      onUserSelect({ email: value, name: value.split('@')[0] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-[#1D9E75]" />
          <Input
            placeholder="Search by email..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-[#13151f] border-2 border-[#1e2130] pl-11 pr-10 text-white focus-visible:ring-[#1D9E75] h-12 rounded-xl placeholder:text-slate-700 font-medium"
            disabled={disabled}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {searching && <Loader2 className="w-3.5 h-3.5 text-[#1D9E75] animate-spin" />}
          </div>
        </div>
        <Button
          type="button"
          onClick={handleInvite}
          disabled={!value.trim() || !value.includes('@')}
          className="bg-white text-black hover:bg-slate-200 h-12 px-6 rounded-xl font-bold transition-all disabled:opacity-30"
        >
          invite
        </Button>
      </div>

      <div className="min-h-[70px] relative">
        {searching && (
          <div className="flex items-center gap-3 p-3.5 bg-white/5 border-2 border-[#1e2130] rounded-2xl animate-pulse">
            <div className="w-11 h-11 rounded-full bg-slate-800" />
            <div className="flex flex-col gap-2">
              <div className="w-24 h-3 bg-slate-800 rounded" />
              <div className="w-32 h-2 bg-slate-800 rounded" />
            </div>
          </div>
        )}

        {!searching && foundUser && (
          <div
            onClick={handleInvite}
            className="flex items-center gap-3 p-3.5 bg-[#1D9E75]/10 border-2 border-[#1D9E75]/30 rounded-2xl cursor-pointer hover:bg-[#1D9E75]/20 transition-all animate-in zoom-in-95 duration-300 group"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#1D9E75] to-emerald-400 flex items-center justify-center text-white text-base font-bold overflow-hidden shadow-lg shadow-[#1D9E75]/20 group-hover:scale-105 transition-transform">
              {foundUser.avatarUrl ? (
                <img src={foundUser.avatarUrl} alt={foundUser.name} className="w-full h-full object-cover" />
              ) : (
                <span>{foundUser.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-white truncate">{foundUser.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#1D9E75] text-[8px] text-white font-black uppercase tracking-widest">Registered</span>
              </div>
              <span className="text-[12px] text-[#1D9E75] font-bold opacity-90 truncate tracking-tight">{foundUser.email}</span>
            </div>
            <div className="ml-auto bg-[#1D9E75] text-white p-2 rounded-full shadow-lg group-hover:rotate-90 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
          </div>
        )}

        {!searching && !foundUser && value.includes('@') && value.split('@')[1].includes('.') && (
          <div
            onClick={handleInvite}
            className="flex items-center gap-3 p-3.5 bg-white/5 border-2 border-[#1e2130] border-dashed rounded-2xl cursor-pointer hover:bg-white/10 transition-all animate-in slide-in-from-top-2 duration-300 group"
          >
            <div className="w-11 h-11 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:bg-slate-700/50 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-slate-200">Invite as new member</span>
              <span className="text-[11px] text-slate-500 font-medium truncate tracking-tight">{value}</span>
            </div>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4 text-[#1D9E75]" />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default InviteMemberInput;

