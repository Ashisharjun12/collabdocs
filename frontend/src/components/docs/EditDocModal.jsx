import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Loader2,
  Pen
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from '../ui/button';
import { useDocStore } from '../../store/doc-store';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { toast } from 'sonner';

const EditDocModal = ({ isOpen, onClose, doc }) => {
  const [title, setTitle] = useState('');
  const { updateDocument, isLoading } = useDocStore();

  useEffect(() => {
    if (doc) {
      setTitle(doc.title);
    }
  }, [doc]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || !doc) return;

    try {
      await updateDocument(doc.id, {
        title: title.trim()
      });
      toast.success("Document renamed");
      onClose();
    } catch (error) {
      toast.error("Failed to rename document");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1c1c1c] border border-[#2e2e2e] text-[#fafafa] sm:max-w-[500px] p-7 overflow-hidden rounded-xl shadow-2xl transition-all">
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-0.5">
            <div className="flex items-center gap-3 mb-1">
               <div className="w-8 h-8 bg-[#3ecf8e]/10 rounded-lg flex items-center justify-center text-[#3ecf8e] border border-[#3ecf8e]/20">
                <Pen className="w-4 h-4" />
              </div>
              <DialogTitle className="text-xl font-medium tracking-tight">Rename Document</DialogTitle>
            </div>
            <DialogDescription className="text-[#898989] text-[12px] font-normal">
              Change the title of your document.
            </DialogDescription>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-medium text-[#898989] uppercase tracking-[1.2px] ml-1">Document Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document Title"
                className="bg-[#171717] border border-[#2e2e2e] text-[#fafafa] focus-visible:ring-[#3ecf8e] h-11 rounded-lg placeholder:text-[#4d4d4d] font-medium px-4 transition-all"
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#2e2e2e]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border border-[#2e2e2e] text-[#898989] hover:text-[#fafafa] hover:bg-[#242424] h-11 px-6 rounded-lg font-medium text-xs border-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim() || isLoading || title === doc?.title}
              className="px-8 bg-[#3ecf8e] hover:bg-[#34b27b] text-[#171717] h-11 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#3ecf8e]/10 transition-all border-none cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Save Changes</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDocModal;
