import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Settings, 
  UserPlus, 
  Link as LinkIcon, 
  Trash2,
  AlertTriangle,
  Pen
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useWorkspaceStore } from '../../store/workspace-store';
import { useAuthStore } from '../../store/auth-store';
import EditWorkspaceModal from './EditWorkspaceModal';
import ShareWorkspaceModal from './ShareWorkspaceModal';
import InviteTeam from './InviteTeam';

const WorkspaceActions = ({ workspace }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { deleteWorkspace, isLoading } = useWorkspaceStore();
  const { user } = useAuthStore();

  const hasPermission = (action) => {
    // Fallback: if userRole is missing, check if they are the ownerId
    const role = workspace.userRole || (workspace.ownerId === user?.id ? 'owner' : 'viewer');
    
    switch (action) {
      case 'invite':
      case 'share':
      case 'edit':
        return role === 'owner' || role === 'admin';
      case 'delete':
        return role === 'owner' && !workspace.isPersonal;
      default:
        return false;
    }
  };

  const handleAction = (action, callback) => {
    setDropdownOpen(false); // Close dropdown immediately
    if (!hasPermission(action)) {
      toast.error("You don't have access to do that");
      return;
    }
    callback();
  };

  const handleDelete = async () => {
    try {
      await deleteWorkspace(workspace.id);
      toast.success("Workspace deleted");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete workspace");
    }
  };

  return (
    <>
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 hover:bg-white/10 transition-all text-slate-400 hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#13151f] border-[#1e2130] text-slate-200 shadow-2xl p-1.5 rounded-xl animate-in zoom-in-95 duration-200 focus:outline-none z-[100]">
            <DropdownMenuItem 
              onClick={() => handleAction('invite', () => setShowInviteModal(true))}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer focus:bg-white/5 focus:text-[#1D9E75] transition-colors group"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Invite</span>
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={() => handleAction('edit', () => setShowEditModal(true))}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer focus:bg-white/5 focus:text-[#1D9E75] transition-colors group"
            >
              <Pen className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Edit Workspace</span>
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={() => handleAction('share', () => setShowShareModal(true))}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer focus:bg-white/5 focus:text-[#1D9E75] transition-colors group"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Share</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-[#1e2130] mx-1" />
            
            {!workspace.isPersonal && (
              <DropdownMenuItem 
                onClick={() => handleAction('delete', () => setShowDeleteDialog(true))}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer focus:bg-red-500/10 focus:text-red-400 transition-colors group"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Delete Workspace</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Settings/Edit Modal */}
      <EditWorkspaceModal 
        workspace={workspace} 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
      />

      {/* Share Modal */}
      <ShareWorkspaceModal
        workspace={workspace}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="bg-[#0b0c14] border-[#1e2130] text-white sm:max-w-[480px] p-0 overflow-hidden rounded-[32px] shadow-2xl transition-all border-opacity-50 backdrop-blur-xl">
          <div className="p-8 space-y-8">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight text-white">Invite Team</DialogTitle>
              <DialogDescription className="text-slate-500 text-[13px] font-medium">
                Add members to collaborate on this workspace.
              </DialogDescription>
            </div>
            <InviteTeam workspace={workspace} onComplete={() => setShowInviteModal(false)} />
          </div>
        </DialogContent>
      </Dialog>


      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#0d0f18] border-[#1e2130] text-white rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete the 
              <span className="text-white font-semibold"> {workspace.name} </span> 
              workspace and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3">
            <AlertDialogCancel className="bg-[#13151f] border-[#1e2130] text-slate-300 hover:bg-[#1a1d28] hover:text-white rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Workspace"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorkspaceActions;
