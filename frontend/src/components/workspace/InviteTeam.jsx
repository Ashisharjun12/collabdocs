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
          {!isEmbedded && <Label className="text-[10px] font-medium text-[#898989] uppercase tracking-[1.2px] ml-1">add people</Label>}
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
            <Label className="text-[10px] font-medium text-[#898989] uppercase tracking-[1.2px] ml-1">selected people · {invitedMembers.length}</Label>
            <div className="max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
              <div className="space-y-2">
                {invitedMembers.map((member) => (
                  <div key={member.email} className="flex items-center justify-between p-3 rounded-xl bg-[#171717] border border-[#2e2e2e] hover:border-[#3ecf8e]/30 transition-all group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#1c1c1c] border border-[#2e2e2e] flex items-center justify-center overflow-hidden shadow-inner">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[11px] font-medium text-[#3ecf8e] uppercase tracking-tight">
                            {member.name?.charAt(0) || member.email.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-medium text-[#fafafa] truncate group-hover:text-[#3ecf8e] transition-colors tracking-tight">{member.name || member.email}</span>
                        <span className="text-[10px] text-[#898989] font-normal truncate">{member.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <RoleSelector
                        value={member.role}
                        onChange={(role) => updateMemberRole(member.email, role)}
                        isCompact
                      />
                      <button onClick={() => removeMember(member.email)} className="text-[#4d4d4d] hover:text-red-400 transition-colors p-1 cursor-pointer">
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
            className="px-8 bg-[#3ecf8e] hover:bg-[#34b27b] text-[#171717] h-11 rounded-lg font-bold flex items-center justify-center gap-3 shadow-lg shadow-[#3ecf8e]/10 disabled:opacity-30 transition-all border-none"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Invitations</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InviteTeam;
