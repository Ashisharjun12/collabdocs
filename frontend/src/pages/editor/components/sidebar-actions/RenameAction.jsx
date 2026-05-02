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
        <DialogContent className="bg-[#171717] border border-[#2e2e2e] text-[#fafafa] shadow-2xl sm:max-w-[420px] rounded-2xl p-0 overflow-hidden border-none focus:outline-none">
          <div className="p-8 pb-4">
            <DialogHeader className="mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#3ecf8e]/10 flex items-center justify-center border border-[#3ecf8e]/20 mb-4">
                <Edit3 className="w-5 h-5 text-[#3ecf8e]" />
              </div>
              <DialogTitle className="text-lg font-bold tracking-tight">Rename Document</DialogTitle>
              <p className="text-xs text-[#4d4d4d] font-medium leading-relaxed mt-1">
                Enter a descriptive title for this file.
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <input
                autoFocus
                disabled={isSaving}
                value={syncedTitle}
                onChange={(e) => handleRename(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
                placeholder="Document title..."
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-[#fafafa] placeholder:text-[#4d4d4d] focus:outline-none focus:border-[#3ecf8e]/40 transition-all font-medium"
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
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#3ecf8e] text-[#171717] px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#3ecf8e]/10 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px] cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Title"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RenameAction;
