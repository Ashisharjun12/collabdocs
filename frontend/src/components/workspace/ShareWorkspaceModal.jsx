import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { useWorkspaceStore } from '../../store/workspace-store';
import { useAuthStore } from '../../store/auth-store';
import { toast } from 'sonner';
import { Globe, Lock, UserPlus, Link as LinkIcon, Users, ChevronDown } from 'lucide-react';
import RoleSelector from './RoleSelector';
import InviteTeam from './InviteTeam';

const ShareWorkspaceModal = ({ workspace, isOpen, onClose }) => {
  const [members, setMembers] = useState(workspace?.members || []);
  const [visibility, setVisibility] = useState(workspace?.visibility || 'private');
  const [linkRole, setLinkRole] = useState(workspace?.linkRole || 'viewer');

  const { fetchWorkspaceDetails, updateMemberRole, removeMember, updateWorkspace } = useWorkspaceStore();
  const { user: authUser } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      if (workspace && isOpen) {
        setVisibility(workspace.visibility);
        setLinkRole(workspace.linkRole || 'viewer');
        
        try {
          const details = await fetchWorkspaceDetails(workspace.id);
          setMembers(details.members || []);
        } catch (error) {
          console.error("Failed to load workspace members");
        }
      }
    };
    init();
  }, [workspace, isOpen]);

  const handleRoleChange = async (memberUserId, newRole) => {
    try {
      await updateMemberRole(workspace.id, memberUserId, newRole);
    } catch (error) {}
  };

  const handleRemoveMember = async (memberUserId) => {
    try {
      await removeMember(workspace.id, memberUserId);
    } catch (error) {}
  };

  const handleVisibilityChange = async (newVisibility) => {
    setVisibility(newVisibility);
    try {
      await updateWorkspace(workspace.id, { visibility: newVisibility });
    } catch (error) {}
  };

  const handleLinkRoleChange = async (newRole) => {
    setLinkRole(newRole);
    try {
      await updateWorkspace(workspace.id, { linkRole: newRole });
    } catch (error) {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d0f18] border-[#1e2130] text-white sm:max-w-[520px] p-0 overflow-hidden rounded-[32px] shadow-2xl transition-all flex flex-col max-h-[85vh]">
        <div className="p-8 pb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight mb-1">Share "{workspace.name}"</DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            Manage who can access this workspace.
          </DialogDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar space-y-8">
          {/* 1. People with Access Section */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">
              People with access
            </Label>
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between group animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75] text-xs font-bold overflow-hidden border border-[#1e2130]">
                      {member.user.avatarUrl ? (
                        <img src={member.user.avatarUrl} alt={member.user.name} className="w-full h-full object-cover" />

                      ) : (
                        member.user.name.charAt(0)
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-white flex items-center gap-1.5">
                        {member.user.name}
                        {member.user.email === authUser?.email && (
                          <span className="text-[10px] text-slate-500 font-medium">(you)</span>
                        )}
                      </span>
                      <span className="text-[11px] text-slate-500">{member.user.email}</span>
                    </div>
                  </div>
                  
                  {member.role === 'owner' ? (
                    <span className="text-[11px] text-slate-500 font-bold px-3 py-1 bg-white/5 rounded-full uppercase tracking-tighter">Owner</span>
                  ) : (
                    <RoleSelector 
                      value={member.role} 
                      onChange={(role) => handleRoleChange(member.user.id, role)}
                      onRemove={() => handleRemoveMember(member.user.id)}
                      isCompact
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. General Access Section */}
          <div className="space-y-4 pb-8">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">
              General Access
            </Label>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#13151f] border border-[#1e2130] hover:border-[#1D9E75]/30 transition-all">
              <div className={`p-2.5 rounded-xl ${
                visibility === 'private' ? 'bg-blue-500/10 text-blue-400' : 
                visibility === 'team' ? 'bg-purple-500/10 text-purple-400' : 
                'bg-[#1D9E75]/10 text-[#1D9E75]'
              }`}>
                {visibility === 'private' ? <Lock className="w-5 h-5" /> : 
                 visibility === 'team' ? <Users className="w-5 h-5" /> : 
                 <Globe className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col min-w-0 relative w-full group/select">
                    <div className="flex items-center relative cursor-pointer w-fit pr-6">
                      <select 
                        value={visibility} 
                        onChange={(e) => handleVisibilityChange(e.target.value)}
                        className="appearance-none bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer pr-1 hover:text-[#1D9E75] transition-colors z-10"
                      >
                        <option value="private" className="bg-[#0d0f18]">Private (Restricted)</option>
                        <option value="team" className="bg-[#0d0f18]">Team Only</option>
                        <option value="public" className="bg-[#0d0f18]">Public (Anyone with link)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-0 pointer-events-none group-hover/select:text-[#1D9E75] transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {visibility === 'private' 
                        ? 'Only people explicitly added can open' 
                        : visibility === 'team'
                        ? 'Only members of this workspace can access'
                        : 'Anyone on the internet with the link can join'}
                    </p>
                  </div>
                  
                  {visibility === 'public' && (
                    <RoleSelector 
                      value={linkRole} 
                      onChange={handleLinkRoleChange} 
                      isCompact 
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#13151f]/50 border-t border-[#1e2130] flex justify-between items-center relative z-20">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              try {
                const code = workspace?.inviteCode || workspace?.id;
                if (!code) {
                  toast.error("Workspace identifier not found");
                  return;
                }
                
                const link = `${window.location.origin}/invite/${code}`;
                
                // Primary method: Clipboard API
                if (navigator.clipboard && window.isSecureContext) {
                  navigator.clipboard.writeText(link)
                    .then(() => toast.success("Link copied!"))
                    .catch(() => fallbackCopy(link));
                } else {
                  fallbackCopy(link);
                }

                function fallbackCopy(text) {
                  const textArea = document.createElement("textarea");
                  textArea.value = text;
                  textArea.style.position = "fixed";
                  textArea.style.left = "-9999px";
                  textArea.style.top = "0";
                  document.body.appendChild(textArea);
                  textArea.focus();
                  textArea.select();
                  try {
                    const successful = document.execCommand('copy');
                    if (successful) toast.success("Link copied!");
                    else toast.error("Unable to copy");
                  } catch (err) {
                    toast.error("Copy failed");
                  }
                  document.body.removeChild(textArea);
                }
              } catch (err) {
                toast.error("An error occurred");
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#1e2130] text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold active:scale-95 group/copy relative z-30"
          >
            <LinkIcon className="w-3.5 h-3.5 text-[#1D9E75] group-hover/copy:scale-110 transition-transform" />
            Copy link
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-[#1D9E75] hover:bg-[#168a65] text-white rounded-full font-bold text-sm shadow-lg shadow-[#1D9E75]/20 transition-all active:scale-95 relative z-30"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareWorkspaceModal;
