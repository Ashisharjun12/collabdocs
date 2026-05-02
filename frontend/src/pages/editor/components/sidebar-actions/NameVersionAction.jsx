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
      const toastId = toast.loading("Capturing snapshot...");
      
      await docApi.saveVersion(docId, nameToSave);
      
      setTimeout(() => {
        toast.success(`Version "${nameToSave}" saved!`, { id: toastId });
        setIsSaving(false);
        setIsOpen(false);
        setVersionName("");
      }, 1200);
    } catch (error) {
      toast.error("Failed to save version snapshot");
      setIsSaving(false);
    }
  };

  return (
    <>
      <SidebarItem
        icon={<BookmarkPlus className="w-4 h-4" />}
        label="Name current version"
        isSubItem={false}
        onClick={() => setIsOpen(true)}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#171717] border border-[#2e2e2e] text-[#fafafa] shadow-2xl sm:max-w-[400px] rounded-2xl p-0 overflow-hidden border-none focus:outline-none">
          <div className="p-8 pb-4">
            <DialogHeader className="mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#3ecf8e]/10 flex items-center justify-center border border-[#3ecf8e]/20 mb-4">
                <BookmarkPlus className="w-5 h-5 text-[#3ecf8e]" />
              </div>
              <DialogTitle className="text-lg font-bold tracking-tight">Name this version</DialogTitle>
              <p className="text-xs text-[#4d4d4d] font-medium leading-relaxed mt-1">
                Give this milestone a name to easily find it in the activity timeline later.
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="e.g. Final Submission, Draft v2"
                autoFocus
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-[#fafafa] placeholder:text-[#4d4d4d] focus:outline-none focus:border-[#3ecf8e]/40 transition-all font-medium"
                onKeyDown={(e) => { 
                  if (e.key === 'Enter') handleSaveVersion(); 
                }}
              />
            </div>
          </div>

          <div className="bg-[#1c1c1c] p-6 flex justify-end gap-3 border-t border-[#2e2e2e] mt-4">
            <button
              onClick={() => setIsOpen(false)}
              className="px-5 py-2 text-xs font-bold text-[#4d4d4d] hover:text-[#fafafa] transition-all uppercase tracking-widest cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveVersion}
              disabled={isSaving || !versionName.trim()}
              className="bg-[#3ecf8e] text-[#171717] px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#3ecf8e]/10 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px] cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Snapshot"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NameVersionAction;
