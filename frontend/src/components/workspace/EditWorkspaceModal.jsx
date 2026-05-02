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
      <DialogContent className="bg-[#1c1c1c] border border-[#2e2e2e] text-[#fafafa] sm:max-w-[500px] p-7 overflow-hidden rounded-xl shadow-2xl transition-all max-h-[90vh] flex flex-col">
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-0.5">
            <DialogTitle className="text-xl font-medium tracking-tight">Workspace Settings</DialogTitle>
            <DialogDescription className="text-[#898989] text-[12px] font-normal">
              Update your workspace name and branding.
            </DialogDescription>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-medium text-[#898989] uppercase tracking-[1.2px] ml-1">
                workspace name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#171717] border border-[#2e2e2e] text-[#fafafa] focus-visible:ring-[#3ecf8e] h-11 rounded-lg placeholder:text-[#4d4d4d] font-medium px-4 transition-all"
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

        <div className="flex items-center gap-3 pt-6 border-t border-[#2e2e2e] mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-transparent border border-[#2e2e2e] text-[#898989] hover:text-[#fafafa] hover:bg-[#242424] h-11 rounded-lg font-medium cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
            className="flex-[2] bg-[#3ecf8e] hover:bg-[#34b27b] text-[#171717] h-11 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#3ecf8e]/10 transition-all border-none cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Save Changes</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditWorkspaceModal;
