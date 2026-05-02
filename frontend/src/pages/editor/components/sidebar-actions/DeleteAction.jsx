import React, { useState } from 'react';
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
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

const DeleteAction = () => {
  const { docId, slug: workspaceSlug } = useParams();
  const navigate = useNavigate();
  const provider = useHocuspocusProvider();
  const { authUser } = useAuthStore();
  const { activeDocument, deleteDocument } = useDocStore();
  const { activeWorkspace } = useWorkspaceStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const member = activeWorkspace?.members?.find(m => String(m.user?.id || m.userId) === String(authUser?.id));
  const userRole = member?.role || 'viewer';
  const isDocOwner = String(activeDocument?.ownerId) === String(authUser?.id);
  const isWorkspaceOwner = userRole === 'owner';
  const canDelete = isDocOwner || isWorkspaceOwner;

  if (!canDelete) return null;

  const handleDelete = async () => {
    if (!docId || !activeDocument) return;
    
    setIsLoading(true);
    try {
      if (provider) {
        const yMap = provider.document.getMap('settings');
        yMap.set('isDeleted', true);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      await deleteDocument(docId);
      toast.success("Document deleted forever");
      
      const targetSlug = workspaceSlug || activeWorkspace?.slug;
      if (targetSlug) {
        navigate(`/dashboard/workspace/${targetSlug}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete document");
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <SidebarItem 
        icon={<Trash2 className="w-4 h-4 text-[#898989] group-hover:text-rose-500 transition-colors" />} 
        label="Delete" 
        onClick={() => setShowConfirm(true)} 
      />

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-[#171717] border border-[#2e2e2e] rounded-2xl p-0 overflow-hidden shadow-2xl max-w-md">
          <div className="p-8">
            <AlertDialogHeader>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20">
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                </div>
                <AlertDialogTitle className="text-xl font-bold text-[#fafafa] tracking-tight">Delete document?</AlertDialogTitle>
                <AlertDialogDescription className="text-[#898989] text-sm leading-relaxed mt-2">
                  This action is permanent. All data and collaborative sessions for this document will be destroyed instantly.
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
                handleDelete();
              }}
              disabled={isLoading}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white border-none font-bold rounded-xl h-12 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                "Delete Forever"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteAction;
