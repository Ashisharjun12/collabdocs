import React, { useState } from 'react';
import { 
  MoreVertical, 
  Trash2,
  Pen,
  Loader2,
  Archive,
  RotateCcw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useDocStore } from '../../store/doc-store';
import EditDocModal from './EditDocModal';

const DocActions = ({ doc }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { deleteDocument, updateDocument, isLoading } = useDocStore();
  const [isArchiving, setIsArchiving] = useState(false);

  const handleToggleArchive = async () => {
    try {
      setIsArchiving(true);
      await updateDocument(doc.id, { isArchived: !doc.isArchived });
      toast.success(doc.isArchived ? "Document unarchived" : "Document archived");
      setDropdownOpen(false);
    } catch (error) {
      toast.error(doc.isArchived ? "Failed to unarchive" : "Failed to archive");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(doc.id);
      toast.success("Document deleted");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete document");
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
              className="h-8 w-8 rounded-lg hover:bg-[#242424] transition-all text-[#4d4d4d] hover:text-[#fafafa] cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#1c1c1c] border-[#2e2e2e] text-[#fafafa] shadow-2xl p-1.5 rounded-xl z-[100]">
            <DropdownMenuItem 
              onClick={() => {
                setDropdownOpen(false);
                setShowEditModal(true);
              }}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer focus:bg-[#242424] focus:text-[#3ecf8e] transition-colors group"
            >
              <Pen className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Rename</span>
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                setDropdownOpen(false);
                setShowArchiveDialog(true);
              }}
              disabled={isArchiving}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer focus:bg-[#242424] focus:text-[#3ecf8e] transition-colors group"
            >
              {isArchiving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : doc.isArchived ? (
                <RotateCcw className="w-3.5 h-3.5" />
              ) : (
                <Archive className="w-3.5 h-3.5" />
              )}
              <span className="text-xs font-medium">{doc.isArchived ? "Unarchive" : "Archive"}</span>
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={() => {
                setDropdownOpen(false);
                setShowDeleteDialog(true);
              }}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer focus:bg-red-500/10 focus:text-red-400 transition-colors group"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditDocModal 
        doc={doc} 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
      />

      {/* Archive Confirmation */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent className="bg-[#1c1c1c] border border-[#2e2e2e] text-[#fafafa] rounded-xl shadow-2xl p-7">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-[#3ecf8e]/10 rounded-lg flex items-center justify-center text-[#3ecf8e] border border-[#3ecf8e]/20">
                <Archive className="w-4 h-4" />
              </div>
              <AlertDialogTitle className="text-xl font-medium tracking-tight">
                {doc.isArchived ? "Unarchive Document?" : "Archive Document?"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-[#898989] text-sm font-normal">
              {doc.isArchived 
                ? `Are you sure you want to unarchive "${doc.title}"? It will be moved back to your active documents.` 
                : `Are you sure you want to archive "${doc.title}"? It will be hidden from your main workspace but not deleted.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#2e2e2e]">
            <AlertDialogCancel className="bg-transparent border border-[#2e2e2e] text-[#898989] hover:bg-[#242424] hover:text-[#fafafa] rounded-lg h-11 px-6 font-medium text-xs transition-all mt-0 border-none cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-[#3ecf8e] hover:bg-[#34b27b] text-[#171717] rounded-lg h-11 px-8 font-bold text-xs shadow-lg shadow-[#3ecf8e]/10 transition-all border-none cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                handleToggleArchive();
                setShowArchiveDialog(false);
              }}
              disabled={isArchiving}
            >
              {isArchiving ? <Loader2 className="w-4 h-4 animate-spin" /> : (doc.isArchived ? "Unarchive" : "Archive")}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#1c1c1c] border border-[#2e2e2e] text-[#fafafa] rounded-xl shadow-2xl p-7">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500 border border-red-500/20">
                <Trash2 className="w-4 h-4" />
              </div>
              <AlertDialogTitle className="text-xl font-medium tracking-tight">Delete Document?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-[#898989] text-sm font-normal">
              Are you sure you want to delete <span className="text-[#fafafa] font-medium">"{doc.title}"</span>? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#2e2e2e]">
            <AlertDialogCancel className="bg-transparent border border-[#2e2e2e] text-[#898989] hover:bg-[#242424] hover:text-[#fafafa] rounded-lg h-11 px-6 font-medium text-xs transition-all mt-0 border-none cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600 text-[#fafafa] rounded-lg h-11 px-8 font-bold text-xs shadow-lg shadow-red-500/20 transition-all border-none cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Document"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocActions;
