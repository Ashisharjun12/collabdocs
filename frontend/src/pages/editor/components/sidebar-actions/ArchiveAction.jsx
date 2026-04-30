import React, { useState } from 'react';
import { Archive, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../store/auth-store';
import { useDocStore } from '../../../../store/doc-store';
import { useWorkspaceStore } from '../../../../store/workspace-store';
import { useHocuspocusProvider } from '@hocuspocus/provider-react';
import SidebarItem from './SidebarItem';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ArchiveAction = () => {
  const { docId } = useParams();
  const provider = useHocuspocusProvider();
  const { authUser } = useAuthStore();
  const { activeDocument, updateDocument } = useDocStore();
  const { activeWorkspace } = useWorkspaceStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Permission Logic: Owners and Admins can archive. Editors cannot.
  const member = activeWorkspace?.members?.find(m => String(m.user?.id || m.userId) === String(authUser?.id));
  const userRole = member?.role || 'viewer';
  
  const isDocOwner = String(activeDocument?.ownerId) === String(authUser?.id);
  const isWorkspaceHighLevel = userRole === 'owner' || userRole === 'admin';
  
  const canArchive = isDocOwner || isWorkspaceHighLevel;

  if (!canArchive) return null;

  const isArchived = activeDocument?.isArchived;

  const handleToggleArchive = async () => {
    if (!docId) return;
    
    setIsLoading(true);
    const newStatus = !isArchived;
    
    try {
      // 1. Update Database via API
      await updateDocument(docId, { isArchived: newStatus });
      
      // 2. Instant Sync: Update Yjs Settings Map for all users
      if (provider) {
        const yMap = provider.document.getMap('settings');
        yMap.set('isArchived', newStatus);
      }
      
      toast.success(newStatus ? "Document archived" : "Document unarchived");
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${newStatus ? 'archive' : 'unarchive'}`);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const handleClick = () => {
    if (isArchived) {
      handleToggleArchive(); // Direct unarchive
    } else {
      setShowConfirm(true); // Confirm archive
    }
  };

  return (
    <>
      <SidebarItem 
        icon={
          isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : isArchived ? (
            <RotateCcw className="w-4 h-4 text-[#1D9E75]" />
          ) : (
            <Archive className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
          )
        } 
        label={isArchived ? "Unarchive" : "Archive"} 
        onClick={handleClick} 
      />

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-[#0a0b10] border border-white/10 rounded-2xl p-6">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-slate-200">Archive document?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-400 text-sm leading-relaxed">
              This will hide the document from your workspace and disconnect all active collaborators. You can unarchive it later from the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="bg-white/5 hover:bg-white/10 border-white/5 text-slate-300 rounded-xl px-6 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); // Prevent closing immediately to show loading
                handleToggleArchive();
              }}
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-600 text-[#0a0b10] border-none font-bold rounded-xl px-6 cursor-pointer min-w-[120px] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Archiving...</span>
                </>
              ) : (
                "Archive Now"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ArchiveAction;
