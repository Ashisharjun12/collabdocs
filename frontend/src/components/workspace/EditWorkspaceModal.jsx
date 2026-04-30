import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useWorkspaceStore } from '../../store/workspace-store';
import { toast } from 'sonner';
import { Loader2, Camera, Type } from 'lucide-react';
import LogoPicker from './LogoPicker';

const EditWorkspaceModal = ({ workspace, isOpen, onClose }) => {
  const [name, setName] = useState(workspace?.name || '');
  const [logo, setLogo] = useState(workspace?.logo || '');
  const [logoType, setLogoType] = useState(workspace?.logoType || 'generated');

  const { updateWorkspace, isLoading } = useWorkspaceStore();

  useEffect(() => {
    if (workspace && isOpen) {
      setName(workspace.name);
      setLogo(workspace.logo);
      setLogoType(workspace.logoType);
    }
  }, [workspace, isOpen]);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Workspace name is required");

    try {
      await updateWorkspace(workspace.id, {
        name,
        logo,
        logoType
      });

      toast.success("Workspace updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update workspace");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d0f18] border-[#1e2130] text-white sm:max-w-[500px] p-7 overflow-hidden rounded-3xl shadow-2xl transition-all max-h-[90vh] flex flex-col">
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-0.5">
            <DialogTitle className="text-xl font-bold tracking-tight">Workspace Settings</DialogTitle>
            <DialogDescription className="text-slate-500 text-[12px]">
              Update your workspace name and branding.
            </DialogDescription>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                workspace name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#13151f] border-2 border-[#1e2130] text-white focus-visible:ring-[#1D9E75] h-11 rounded-xl placeholder:text-slate-700 font-medium px-4"
                disabled={isLoading}
              />
            </div>

            <LogoPicker
              value={logo}
              onChange={setLogo}
              logoType={logoType}
              onTypeChange={setLogoType}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-[#1e2130] mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-transparent border-2 border-[#1e2130] text-slate-400 hover:text-white hover:bg-white/5 h-11 rounded-xl font-bold"
          >
            cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
            className="flex-[2] bg-[#1D9E75] hover:bg-[#168a65] text-white h-11 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-[#1D9E75]/20"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Save Changes</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditWorkspaceModal;
