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
      <DialogContent className="bg-[#0d0f18] border-[#1e2130] text-white sm:max-w-[500px] p-7 overflow-hidden rounded-3xl shadow-2xl transition-all">
        <div className="space-y-6">
          <div className="space-y-0.5">
            <div className="flex items-center gap-3 mb-1">
               <div className="w-8 h-8 bg-[#1D9E75]/10 rounded-lg flex items-center justify-center text-[#1D9E75]">
                <Pen className="w-4 h-4" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight">Rename Document</DialogTitle>
            </div>
            <DialogDescription className="text-slate-500 text-[12px]">
              Change the title of your document.
            </DialogDescription>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Document Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document Title"
                className="bg-[#13151f] border-2 border-[#1e2130] text-white focus-visible:ring-[#1D9E75] h-11 rounded-xl placeholder:text-slate-700 font-medium px-4"
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-[#1e2130]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent border-2 border-[#1e2130] text-slate-400 hover:text-white hover:bg-white/5 h-12 rounded-xl font-bold text-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim() || isLoading || title === doc?.title}
              className="flex-[2] bg-[#1D9E75] hover:bg-[#168a65] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-[#1D9E75]/20"
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
