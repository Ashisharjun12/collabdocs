import React, { useState } from 'react';
import { 
  FileText, 
  Lock, 
  Globe, 
  Users,
  Loader2,
  Plus
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from './ui/button';
import { useDocStore } from '../store/doc-store';
import { useNavigate } from 'react-router-dom';
import { Label } from './ui/label';
import { Input } from './ui/input';

const CreateDocModal = ({ isOpen, onClose, workspaceId, workspaceSlug }) => {
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('workspace');
  const { createDocument, isLoading } = useDocStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || !workspaceId) return;

    try {
      const newDoc = await createDocument(workspaceId, {
        title: title.trim(),
        visibility
      });
      resetForm();
      onClose();
      navigate(`/dashboard/workspace/${workspaceSlug}/doc/${newDoc.id}`);
    } catch (error) {
      console.error("Failed to create document", error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setVisibility('workspace');
  };

  const visibilityOptions = [
    {
      id: 'private',
      label: 'Private',
      icon: Lock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
    {
      id: 'workspace',
      label: 'Workspace',
      icon: Users,
      color: 'text-[#1D9E75]',
      bg: 'bg-[#1D9E75]/10'
    },
    {
      id: 'public',
      label: 'Public',
      icon: Globe,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if(!val) { resetForm(); onClose(); } }}>
      <DialogContent className="bg-[#1c1c1c] border border-[#2e2e2e] text-[#fafafa] sm:max-w-[500px] p-7 overflow-hidden rounded-xl shadow-2xl transition-all">
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-0.5">
            <div className="flex items-center gap-3 mb-1">
               <div className="w-8 h-8 bg-[#3ecf8e]/10 rounded-lg flex items-center justify-center text-[#3ecf8e] border border-[#3ecf8e]/20">
                <Plus className="w-4 h-4" />
              </div>
              <DialogTitle className="text-xl font-medium tracking-tight">Create Document</DialogTitle>
            </div>
            <DialogDescription className="text-[#898989] text-[12px] font-normal">
              Start a new page to organize your thoughts
            </DialogDescription>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-medium text-[#898989] uppercase tracking-[1.2px] ml-1">Document Title</Label>
              <div className="relative group">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Untitled Document"
                  className="bg-[#171717] border border-[#2e2e2e] text-[#fafafa] focus-visible:ring-[#3ecf8e] h-11 rounded-lg placeholder:text-[#4d4d4d] font-medium px-4 transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-medium text-[#898989] uppercase tracking-[1.2px] ml-1">Visibility</Label>
              <div className="grid grid-cols-3 gap-3">
                {visibilityOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setVisibility(option.id)}
                    className={`
                      flex flex-col items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                      ${visibility === option.id 
                        ? 'bg-[#3ecf8e]/5 border-[#3ecf8e] shadow-[0_0_15px_rgba(62,207,142,0.05)]' 
                        : 'bg-[#171717] border-[#2e2e2e] hover:bg-[#242424] hover:border-[#363636]'
                      }
                    `}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      visibility === option.id ? 'bg-[#3ecf8e]/20 text-[#3ecf8e]' : 'bg-[#1c1c1c] text-[#4d4d4d]'
                    }`}>
                      <option.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-medium tracking-tight ${visibility === option.id ? 'text-[#fafafa]' : 'text-[#898989]'}`}>
                      {option.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-[#2e2e2e]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent border border-[#2e2e2e] text-[#898989] hover:text-[#fafafa] hover:bg-[#242424] h-12 rounded-lg font-medium text-sm cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim() || isLoading}
              className="flex-[2] bg-[#3ecf8e] hover:bg-[#34b27b] text-[#171717] h-12 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#3ecf8e]/10 transition-all border-none cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Document</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDocModal;
