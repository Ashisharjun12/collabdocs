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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4d4d] transition-colors group-focus-within:text-[#3ecf8e]" />
          <Input
            placeholder="Search by email..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-[#171717] border border-[#2e2e2e] pl-11 pr-10 text-[#fafafa] focus-visible:ring-[#3ecf8e] h-12 rounded-lg placeholder:text-[#4d4d4d] font-medium transition-all"
            disabled={disabled}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {searching && <Loader2 className="w-3.5 h-3.5 text-[#3ecf8e] animate-spin" />}
          </div>
        </div>
        <Button
          type="button"
          onClick={handleInvite}
          disabled={!value.trim() || !value.includes('@')}
          className="bg-[#fafafa] text-[#171717] hover:bg-[#898989] h-12 px-6 rounded-lg font-bold transition-all disabled:opacity-30 border-none cursor-pointer"
        >
          Add
        </Button>
      </div>

      <div className="min-h-[70px] relative">
        {searching && (
          <div className="flex items-center gap-3 p-3.5 bg-[#171717] border border-[#2e2e2e] rounded-xl animate-pulse">
            <div className="w-11 h-11 rounded-full bg-[#242424]" />
            <div className="flex flex-col gap-2">
              <div className="w-24 h-3 bg-[#242424] rounded" />
              <div className="w-32 h-2 bg-[#242424] rounded" />
            </div>
          </div>
        )}

        {!searching && foundUser && (
          <div
            onClick={handleInvite}
            className="flex items-center gap-3 p-3.5 bg-[#3ecf8e]/5 border border-[#3ecf8e]/30 rounded-xl cursor-pointer hover:bg-[#3ecf8e]/10 transition-all animate-in zoom-in-95 duration-300 group"
          >
            <div className="w-11 h-11 rounded-lg bg-[#171717] border border-[#2e2e2e] flex items-center justify-center text-[#fafafa] text-base font-bold overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
              {foundUser.avatarUrl ? (
                <img src={foundUser.avatarUrl} alt={foundUser.name} className="w-full h-full object-cover" />
              ) : (
                <span>{foundUser.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-[#fafafa] truncate tracking-tight">{foundUser.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#3ecf8e]/20 text-[8px] text-[#3ecf8e] font-bold uppercase tracking-[1.2px] border border-[#3ecf8e]/20">Registered</span>
              </div>
              <span className="text-[12px] text-[#3ecf8e] font-medium opacity-90 truncate tracking-tight">{foundUser.email}</span>
            </div>
            <div className="ml-auto bg-[#3ecf8e] text-[#171717] p-2 rounded-lg shadow-lg group-hover:rotate-90 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
          </div>
        )}

        {!searching && !foundUser && value.includes('@') && value.split('@')[1].includes('.') && (
          <div
            onClick={handleInvite}
            className="flex items-center gap-3 p-3.5 bg-[#171717] border border-[#2e2e2e] border-dashed rounded-xl cursor-pointer hover:bg-[#242424] transition-all animate-in slide-in-from-top-2 duration-300 group"
          >
            <div className="w-11 h-11 rounded-lg bg-[#1c1c1c] flex items-center justify-center text-[#4d4d4d] group-hover:bg-[#2e2e2e] transition-colors border border-[#2e2e2e]">
              <Plus className="w-6 h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-[#fafafa] tracking-tight">Invite as new member</span>
              <span className="text-[11px] text-[#898989] font-normal truncate tracking-tight">{value}</span>
            </div>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4 text-[#3ecf8e]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteMemberInput;

