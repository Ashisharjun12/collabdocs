import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspace-store';
import { useAuthStore } from '../../store/auth-store';
import { 
  Users, 
  Shield, 
  ShieldCheck, 
  User, 
  Mail,
  Loader2
} from 'lucide-react';
import Avvvatars from 'avvvatars-react';
import { Button } from '../../components/ui/button';


const WorkspaceMembers = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { 
    workspaces, 
    activeWorkspace, 
    setActiveWorkspace, 
    fetchWorkspaceDetails,
    updateMemberRole,
    removeMember,
    isLoading
  } = useWorkspaceStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle active workspace selection based on slug
  useEffect(() => {
    if (workspaces.length > 0) {
      const workspace = workspaces.find(ws => ws.slug === slug);
      if (workspace) {
        if (activeWorkspace?.id !== workspace.id) {
          setActiveWorkspace(workspace);
        }
      } else {
        setActiveWorkspace(workspaces[0]);
        navigate(`/dashboard/workspace/${workspaces[0].slug}/members`, { replace: true });
      }
    }
  }, [slug, workspaces.length, navigate]); // Only depend on slug and initial load

  // Handle fetching details for the active workspace
  useEffect(() => {
    if (activeWorkspace?.id) {
      fetchWorkspaceDetails(activeWorkspace.id);
    }
  }, [activeWorkspace?.id]); // ONLY fetch when ID changes


  const handleRefresh = async () => {
    if (activeWorkspace) {
      setIsRefreshing(true);
      await fetchWorkspaceDetails(activeWorkspace.id);
      setIsRefreshing(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'owner': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
      case 'admin': return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/20';
      case 'editor': return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      case 'viewer': return 'bg-slate-400/10 text-slate-400 border-slate-400/20';
      default: return 'bg-slate-800/10 text-slate-500 border-slate-800/20';
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'owner': return <ShieldCheck className="w-3 h-3" />;
      case 'admin': return <Shield className="w-3 h-3" />;
      case 'editor': return <User className="w-3 h-3" />;
      case 'viewer': return <User className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  // Show loader only if we don't have a workspace or we're doing the initial fetch and have no members yet
  if (!activeWorkspace || (isLoading && (!activeWorkspace.members || activeWorkspace.members.length === 0))) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#1D9E75] animate-spin" />
          <p className="text-slate-500 text-sm font-medium animate-pulse">Loading members...</p>
        </div>
      </div>
    );
  }


  const currentUserRole = activeWorkspace.userRole?.toLowerCase();
  const isOwnerOrAdmin = currentUserRole === 'owner' || currentUserRole === 'admin';
  const members = activeWorkspace.members || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center border border-[#1D9E75]/20">
              <Users className="w-5 h-5 text-[#1D9E75]" />
            </div>
            Workspace Members
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Manage your team and their access levels for {activeWorkspace.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
           <Button 
             variant="outline" 
             className="bg-[#13151f] border-[#1e2130] text-slate-300 hover:text-white rounded-xl h-11 px-5 cursor-pointer"
             onClick={handleRefresh}
             disabled={isRefreshing}
           >
             {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
           </Button>
        </div>


      </div>

      {/* Members Table */}
      <div className="bg-[#13151f]/30 border border-[#1e2130] rounded-[32px] overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e2130] bg-[#0d0f18]/50">
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Member</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Role</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2130]/50">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-[#13151f]/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl overflow-hidden border border-[#1e2130] shadow-md group-hover:border-[#1D9E75]/30 transition-colors bg-[#0d0f18] flex items-center justify-center">
                        <Avvvatars value={member.user?.email || member.user?.name || 'user'} size={40} style="shape" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-white group-hover:text-[#1D9E75] transition-colors truncate tracking-tight">
                          {member.user?.name || 'Unnamed User'}
                          {authUser?.id === member.user?.id && <span className="ml-2 text-[10px] bg-[#1D9E75]/10 text-[#1D9E75] px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#1D9E75]/10 font-black">You</span>}
                        </p>
                        <p className="text-[11px] text-slate-500 font-bold mt-0.5">Joined recently</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRoleBadgeColor(member.role)}`}>
                      {getRoleIcon(member.role)}
                      {member.role}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300 transition-colors font-medium text-[13px]">
                      <Mail className="w-3.5 h-3.5 opacity-50" />
                      {member.user?.email}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {members.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
             <div className="w-20 h-20 bg-[#1a1d28] rounded-full flex items-center justify-center mb-6 border border-[#1e2130] shadow-inner">
               <Users className="w-10 h-10 text-slate-700" />
             </div>
             <h3 className="text-white text-lg font-bold mb-2">No members found</h3>
             <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed">
               Something went wrong. Try refreshing the page to see the member list.
             </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between text-[11px] text-slate-600 font-bold uppercase tracking-widest px-4">
        <p>Total {members.length} members</p>
        <p>Workspace Visibility: <span className="text-slate-400">{activeWorkspace.visibility}</span></p>
      </div>
    </div>
  );
};

export default WorkspaceMembers;
