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
      case 'owner': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'admin': return 'bg-[#3ecf8e]/10 text-[#3ecf8e] border-[#3ecf8e]/20';
      case 'editor': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'viewer': return 'bg-[#898989]/10 text-[#898989] border-[#898989]/20';
      default: return 'bg-[#2e2e2e]/10 text-[#4d4d4d] border-[#2e2e2e]/20';
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
          <Loader2 className="w-10 h-10 text-[#3ecf8e] animate-spin" />
          <p className="text-[#898989] text-sm font-medium animate-pulse">Loading members...</p>
        </div>
      </div>
    );
  }


  const currentUserRole = activeWorkspace.userRole?.toLowerCase();
  const isOwnerOrAdmin = currentUserRole === 'owner' || currentUserRole === 'admin';
  const members = activeWorkspace.members || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 selection:bg-[#3ecf8e]/30 selection:text-[#fafafa]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-medium text-[#fafafa] tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#3ecf8e]/10 flex items-center justify-center border border-[#3ecf8e]/20">
              <Users className="w-6 h-6 text-[#3ecf8e]" />
            </div>
            Workspace Members
          </h1>
          <p className="text-[#898989] text-[14px] mt-3 font-normal">
            Manage your team and their access levels for {activeWorkspace.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
           <Button 
             variant="outline" 
             className="bg-[#1c1c1c] border-[#2e2e2e] text-[#898989] hover:text-[#fafafa] rounded-lg h-11 px-5 cursor-pointer"
             onClick={handleRefresh}
             disabled={isRefreshing}
           >
             {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
           </Button>
        </div>


      </div>

      {/* Members Table */}
      <div className="bg-[#1c1c1c] border border-[#242424] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2e2e2e] bg-[#171717]">
                <th className="px-6 py-5 text-[11px] font-medium uppercase tracking-[1.2px] text-[#4d4d4d]">Member</th>
                <th className="px-6 py-5 text-[11px] font-medium uppercase tracking-[1.2px] text-[#4d4d4d]">Role</th>
                <th className="px-6 py-5 text-[11px] font-medium uppercase tracking-[1.2px] text-[#4d4d4d]">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e]/30">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-[#242424] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#2e2e2e] shadow-sm group-hover:border-[#3ecf8e]/30 transition-colors bg-[#171717] flex items-center justify-center">
                        <Avvvatars value={member.user?.email || member.user?.name || 'user'} size={40} style="shape" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-[#fafafa] group-hover:text-[#3ecf8e] transition-colors truncate tracking-tight">
                          {member.user?.name || 'Unnamed User'}
                          {authUser?.id === member.user?.id && <span className="ml-2 text-[10px] bg-[#3ecf8e]/10 text-[#3ecf8e] px-2 py-0.5 rounded-lg uppercase tracking-[1.2px] border border-[#3ecf8e]/10 font-medium">You</span>}
                        </p>
                        <p className="text-[11px] text-[#4d4d4d] font-normal mt-0.5">Joined recently</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-[1.2px] border ${getRoleBadgeColor(member.role)}`}>
                      {getRoleIcon(member.role)}
                      {member.role}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-[#898989] group-hover:text-[#fafafa] transition-colors font-normal text-[13px]">
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
          <div className="py-24 flex flex-col items-center justify-center text-center px-4">
             <div className="w-20 h-20 bg-[#171717] rounded-full flex items-center justify-center mb-6 border border-[#2e2e2e]">
               <Users className="w-10 h-10 text-[#2e2e2e]" />
             </div>
             <h3 className="text-[#fafafa] text-lg font-medium mb-3">No members found</h3>
             <p className="text-[#898989] text-[14px] max-w-sm font-normal leading-relaxed">
               Something went wrong. Try refreshing the page to see the member list.
             </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between text-[11px] text-[#4d4d4d] font-medium uppercase tracking-[1.2px] px-4">
        <p>Total {members.length} members</p>
        <p>Workspace Visibility: <span className="text-[#898989]">{activeWorkspace.visibility}</span></p>
      </div>
    </div>
  );
};

export default WorkspaceMembers;
