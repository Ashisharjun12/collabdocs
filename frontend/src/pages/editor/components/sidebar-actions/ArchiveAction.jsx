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
      await updateDocument(docId, { isArchived: newStatus });
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
    if (isArchived) handleToggleArchive();
    else setShowConfirm(true);
  };

  return (
    <>
      <SidebarItem 
        icon={
          isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#898989]" />
          ) : isArchived ? (
            <RotateCcw className="w-4 h-4 text-[#3ecf8e]" />
          ) : (
            <Archive className="w-4 h-4 text-[#898989] group-hover:text-amber-500 transition-colors" />
          )
        } 
        label={isArchived ? "Unarchive" : "Archive"} 
        onClick={handleClick} 
      />

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-[#171717] border border-[#2e2e2e] rounded-2xl p-0 overflow-hidden shadow-2xl max-w-md">
          <div className="p-8">
            <AlertDialogHeader>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
                  <Archive className="w-8 h-8 text-amber-500" />
                </div>
                <AlertDialogTitle className="text-xl font-bold text-[#fafafa] tracking-tight">Archive document?</AlertDialogTitle>
                <AlertDialogDescription className="text-[#898989] text-sm leading-relaxed mt-2">
                  This will hide the document from your active workspace. You can restore it anytime from the dashboard archives.
                </AlertDialogDescription>
              </div>
            </AlertDialogHeader>
          </div>

          <div className="bg-[#1c1c1c] p-6 flex flex-col sm:flex-row gap-3 border-t border-[#2e2e2e]">
            <AlertDialogCancel className="flex-1 bg-[#242424] hover:bg-[#2e2e2e] border-none text-[#fafafa] rounded-xl h-12 font-medium cursor-pointer transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleToggleArchive();
              }}
              disabled={isLoading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-[#171717] border-none font-bold rounded-xl h-12 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Archiving...</span>
                </>
              ) : (
                "Archive Now"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ArchiveAction;
