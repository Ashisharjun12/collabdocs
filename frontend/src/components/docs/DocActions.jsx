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
              className="h-8 w-8 rounded-xl hover:bg-white/5 transition-all text-slate-500 hover:text-white cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#13151f] border-[#1e2130] text-slate-200 shadow-2xl p-1.5 rounded-xl z-[100]">
            <DropdownMenuItem 
              onClick={() => {
                setDropdownOpen(false);
                setShowEditModal(true);
              }}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer focus:bg-white/5 focus:text-[#1D9E75] transition-colors group"
            >
              <Pen className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Rename</span>
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                handleToggleArchive();
              }}
              disabled={isArchiving}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer focus:bg-white/5 focus:text-[#1D9E75] transition-colors group"
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#0d0f18] border-[#1e2130] text-white rounded-3xl shadow-2xl p-7">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Document?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-sm">
              Are you sure you want to delete <span className="text-white font-bold">"{doc.title}"</span>? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="bg-[#13151f] border-2 border-[#1e2130] text-slate-300 hover:bg-[#1a1d28] hover:text-white rounded-xl h-11 px-6 font-bold text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 px-6 font-bold text-xs shadow-lg shadow-red-500/20 transition-all active:scale-95 border-0"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocActions;
