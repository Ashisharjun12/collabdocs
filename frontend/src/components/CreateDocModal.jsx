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
      <DialogContent className="bg-[#0d0f18] border-[#1e2130] text-white sm:max-w-[500px] p-7 overflow-hidden rounded-3xl shadow-2xl transition-all">
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-0.5">
            <div className="flex items-center gap-3 mb-1">
               <div className="w-8 h-8 bg-[#1D9E75]/10 rounded-lg flex items-center justify-center text-[#1D9E75]">
                <Plus className="w-4 h-4" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight">create document</DialogTitle>
            </div>
            <DialogDescription className="text-slate-500 text-[12px]">
              start a new page to organize your thoughts
            </DialogDescription>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Document Title</Label>
              <div className="relative group">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Untitled Document"
                  className="bg-[#13151f] border-2 border-[#1e2130] text-white focus-visible:ring-[#1D9E75] h-11 rounded-xl placeholder:text-slate-700 font-medium px-4"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Visibility</Label>
              <div className="grid grid-cols-3 gap-3">
                {visibilityOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setVisibility(option.id)}
                    className={`
                      flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all
                      ${visibility === option.id 
                        ? 'bg-[#1D9E75]/5 border-[#1D9E75] shadow-[0_0_15px_rgba(29,158,117,0.1)]' 
                        : 'bg-[#13151f] border-[#1e2130] hover:bg-[#1a1d28] hover:border-[#2a2d3a]'
                      }
                    `}
                  >
                    <div className={`w-8 h-8 ${option.bg} ${option.color} rounded-lg flex items-center justify-center shrink-0`}>
                      <option.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-bold ${visibility === option.id ? 'text-white' : 'text-slate-500'}`}>
                      {option.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-[#1e2130]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent border-2 border-[#1e2130] text-slate-400 hover:text-white hover:bg-white/5 h-12 rounded-xl font-bold text-sm"
            >
              cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim() || isLoading}
              className="flex-[2] bg-[#1D9E75] hover:bg-[#168a65] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-[#1D9E75]/20"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>create document ✍️</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDocModal;
