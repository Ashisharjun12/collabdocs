import React, { useState } from 'react';
import { BookmarkPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SidebarItem from './SidebarItem';
import { docApi } from '../../../../services/api';

const NameVersionAction = () => {
  const { docId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [versionName, setVersionName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveVersion = async () => {
    if (!versionName.trim()) return;
    try {
      setIsSaving(true);
      const nameToSave = versionName;
      
      const toastId = toast.loading("Saving version snapshot...");
      await docApi.saveVersion(docId, nameToSave);
      
      // Delay so background worker finishes
      setTimeout(() => {
        toast.success(`Version "${nameToSave}" saved!`, { id: toastId });
        setIsSaving(false);
        setIsOpen(false);
        setVersionName("");
      }, 1500);
    } catch (error) {
      console.error("Failed to save version:", error);
      toast.error("Failed to save version snapshot");
      setIsSaving(false);
    }
  };

  return (
    <>
      <SidebarItem
        icon={<BookmarkPlus className="w-4 h-4" />}
        label="Name current version"
        isSubItem={true}
        onClick={() => setIsOpen(true)}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#ffffff] dark:bg-[#16171d] border-slate-200 dark:border-white/10 text-slate-800 dark:text-white shadow-2xl sm:max-w-[360px] rounded-[16px] p-5 focus:outline-none">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-[15px] font-bold">Name current version</DialogTitle>
          </DialogHeader>

          <div className="flex gap-2">
            <input
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="e.g. Final Draft"
              autoFocus
              className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[13px] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#1D9E75] transition-all"
              onKeyDown={(e) => { 
                if (e.key === 'Enter') handleSaveVersion(); 
              }}
            />
            <button
              onClick={handleSaveVersion}
              disabled={isSaving || !versionName.trim()}
              className="bg-[#1D9E75] text-white px-4 py-2 rounded-xl text-[12px] font-bold shadow-md shadow-[#1D9E75]/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center min-w-[70px]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NameVersionAction;
