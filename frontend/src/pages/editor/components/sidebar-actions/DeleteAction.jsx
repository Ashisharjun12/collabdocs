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

  // Permission Logic: Only the Workspace Owner or the Document Creator can delete
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
      // 1. Broadcast deletion to all users via Yjs
      if (provider) {
        const yMap = provider.document.getMap('settings');
        yMap.set('isDeleted', true);
      }

      // 2. Delay slightly to allow the signal to reach others before nuking the doc
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. Delete from database
      await deleteDocument(docId);
      
      toast.success("Document deleted forever");
      
      // Navigate using the slug from params or the active workspace
      const targetSlug = workspaceSlug || currentWorkspace?.slug;
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
        icon={<Trash2 className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />} 
        label="Delete" 
        onClick={() => setShowConfirm(true)} 
      />

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-[#0a0b10] border border-white/10 rounded-2xl p-6">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-slate-200">Delete document?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-400 text-sm leading-relaxed">
              This action is <span className="text-rose-500 font-bold underline">permanent</span>. All data and collaborative sessions for this document will be destroyed instantly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="bg-white/5 hover:bg-white/10 border-white/5 text-slate-300 rounded-xl px-6 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isLoading}
              className="bg-rose-500 hover:bg-rose-600 text-white border-none font-bold rounded-xl px-6 cursor-pointer min-w-[120px] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteAction;
