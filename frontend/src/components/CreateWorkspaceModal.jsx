import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useWorkspaceStore } from '../store/workspace-store';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';

// Sub-components
import VisibilitySelector from './workspace/VisibilitySelector';
import LogoPicker from './workspace/LogoPicker';

const CreateWorkspaceModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState(Math.random().toString(36).substring(7));
  const [logoType, setLogoType] = useState('generated');
  const [visibility, setVisibility] = useState('private');

  const { createWorkspace, isLoading } = useWorkspaceStore();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Workspace name is required");

    try {
      const workspace = await createWorkspace({
        name,
        visibility,
        logo,
        logoType,
        invites: [] // No invites in this simple flow
      });

      toast.success("Workspace created successfully");
      resetForm();
      onClose();
      navigate(`/dashboard/workspace/${workspace.slug}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create workspace");
    }
  };

  const resetForm = () => {
    setName('');
    setLogo(Math.random().toString(36).substring(7));
    setLogoType('generated');
    setVisibility('private');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) { resetForm(); onClose(); } }}>
      <DialogContent className="bg-[#0d0f18] border-[#1e2130] text-white sm:max-w-[500px] p-7 overflow-hidden rounded-3xl shadow-2xl transition-all">
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-0.5">
            <DialogTitle className="text-xl font-bold tracking-tight">create workspace</DialogTitle>
            <DialogDescription className="text-slate-500 text-[12px]">
              a shared space for your team's documents
            </DialogDescription>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                workspace name
              </Label>
              <Input
                id="name"
                placeholder="CollabDocs Project"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#13151f] border-2 border-[#1e2130] text-white focus-visible:ring-[#1D9E75] h-11 rounded-xl placeholder:text-slate-700 font-medium px-4"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <LogoPicker
              value={logo}
              onChange={setLogo}
              logoType={logoType}
              onTypeChange={setLogoType}
            />

            <VisibilitySelector
              value={visibility}
              onChange={setVisibility}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-[#1e2130]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent border-2 border-[#1e2130] text-slate-400 hover:text-white hover:bg-white/5 h-12 rounded-xl font-bold"
            >
              cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!name.trim() || isLoading}
              className="flex-[2] bg-[#1D9E75] hover:bg-[#168a65] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-[#1D9E75]/20"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>create workspace 🚀</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceModal;
