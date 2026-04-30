import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { Loader2, Copy, X, Check, ArrowRight } from 'lucide-react';
import RoleSelector from './RoleSelector';
import InviteMemberInput from './InviteMemberInput';

import { useAuthStore } from '../../store/auth-store';
import { workspaceApi } from '../../services/api';

const InviteTeam = ({ workspace, onComplete, isEmbedded = false }) => {
  const { authUser } = useAuthStore();
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('editor');
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const handleAddMember = (user) => {
    if (user.email === authUser?.email) {
      return toast.error("You are already in this workspace");
    }
    if (invitedMembers.find(m => m.email === user.email)) {
      return toast.error("User already added to the list");
    }
    setInvitedMembers([...invitedMembers, { ...user, role: selectedRole }]);
    setInviteEmail('');
  };

  const updateMemberRole = (email, role) => {
    setInvitedMembers(invitedMembers.map(m =>
      m.email === email ? { ...m, role } : m
    ));
  };

  const removeMember = (email) => {
    setInvitedMembers(invitedMembers.filter(m => m.email !== email));
  };

  const handleInviteAll = async () => {
    if (invitedMembers.length === 0) {
      return onComplete?.();
    }

    setIsSending(true);
    try {
      await workspaceApi.bulkInvite(workspace.id, invitedMembers.map(m => ({
        email: m.email,
        role: m.role
      })));
      toast.success("Invitations sent successfully!");
      setInvitedMembers([]);
      onComplete?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send invitations");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="space-y-4">
        <div className="space-y-2">
          {!isEmbedded && <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">add people</Label>}
          <InviteMemberInput
            value={inviteEmail}
            onChange={setInviteEmail}
            onUserSelect={handleAddMember}
            disabled={isSending}
            placeholder="Add people by email..."
          />
        </div>

        {invitedMembers.length > 0 && (
          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">selected people · {invitedMembers.length}</Label>
            <div className="max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
              <div className="space-y-2">
                {invitedMembers.map((member) => (
                  <div key={member.email} className="flex items-center justify-between p-3 rounded-2xl bg-[#13151f]/50 border border-[#1e2130] hover:border-[#1D9E75]/30 transition-all group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1D9E75]/20 to-emerald-500/10 border border-[#1D9E75]/20 flex items-center justify-center overflow-hidden shadow-inner">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[11px] font-bold text-[#1D9E75] uppercase tracking-tighter">
                            {member.name?.charAt(0) || member.email.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-bold text-white truncate group-hover:text-[#1D9E75] transition-colors">{member.name || member.email}</span>
                        <span className="text-[10px] text-slate-500 font-medium truncate">{member.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <RoleSelector
                        value={member.role}
                        onChange={(role) => updateMemberRole(member.email, role)}
                        isCompact
                      />
                      <button onClick={() => removeMember(member.email)} className="text-slate-600 hover:text-red-400 transition-colors p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleInviteAll}
            disabled={isSending || invitedMembers.length === 0}
            className="px-8 bg-[#1D9E75] hover:bg-[#168a65] text-white h-11 rounded-full font-bold flex items-center justify-center gap-3 shadow-lg shadow-[#1D9E75]/10 disabled:opacity-30 transition-all"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Invite</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InviteTeam;
