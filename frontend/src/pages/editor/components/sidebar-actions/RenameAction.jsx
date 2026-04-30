import React, { useState, useEffect } from 'react';
import { Edit3, Loader2 } from 'lucide-react';
import { useHocuspocusProvider } from '@hocuspocus/provider-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SidebarItem from './SidebarItem';

const RenameAction = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncedTitle, setSyncedTitle] = useState("");
  const provider = useHocuspocusProvider();

  useEffect(() => {
    if (!provider) return;
    const yText = provider.document.getText('title');
    const updateTitle = () => setSyncedTitle(yText.toString() || "");
    yText.observe(updateTitle);
    updateTitle();
    return () => yText.unobserve(updateTitle);
  }, [provider]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setIsOpen(false);
  };

  const handleRename = (val) => {
    setSyncedTitle(val);
    const yText = provider.document.getText('title');
    yText.delete(0, yText.length);
    yText.insert(0, val);
  };

  return (
    <>
      <SidebarItem
        icon={<Edit3 className="w-4 h-4" />}
        label="Rename"
        onClick={() => setIsOpen(true)}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#ffffff] dark:bg-[#16171d] border-slate-200 dark:border-white/10 text-slate-800 dark:text-white shadow-2xl sm:max-w-[425px] rounded-[16px] p-0 overflow-hidden border-none focus:outline-none">
          <div className="sr-only">
            <DialogHeader><DialogTitle>Rename Document</DialogTitle></DialogHeader>
          </div>
          <div className="flex flex-col">
            <div className="px-5 py-3 flex items-center gap-3 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
              <div className="w-5 h-5 bg-[#1D9E75] rounded flex items-center justify-center shadow-md shadow-[#1D9E75]/20">
                <Edit3 className="w-3 h-3 text-white" />
              </div>
              <span className="text-[14px] font-medium text-slate-800 dark:text-slate-200">Rename Document</span>
            </div>

            <div className="p-6">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">New Title</label>
              <input
                autoFocus
                disabled={isSaving}
                value={syncedTitle}
                onChange={(e) => handleRename(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
                placeholder="Enter document title..."
                className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#1D9E75]/50 transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-white/[0.01] border-t border-slate-200 dark:border-white/5">
              <button
                disabled={isSaving}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isSaving}
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-[#1D9E75] rounded-xl text-xs font-bold text-white shadow-lg shadow-[#1D9E75]/20 hover:opacity-90 transition-all disabled:opacity-70 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RenameAction;
