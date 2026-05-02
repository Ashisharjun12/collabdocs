import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspace-store';
import { useAuthStore } from '../../store/auth-store';
import { 
  Settings, 
  Trash2, 
  Save, 
  Loader2, 
  Shield, 
  Globe, 
  Users, 
  Lock,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { toast } from 'sonner';

const WorkspaceSettings = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { 
    workspaces, 
    activeWorkspace, 
    setActiveWorkspace, 
    updateWorkspace,
    deleteWorkspace,
    isLoading 
  } = useWorkspaceStore();

  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (workspaces.length > 0) {
      const workspace = workspaces.find(ws => ws.slug === slug);
      if (workspace) {
        setActiveWorkspace(workspace);
        setName(workspace.name || '');
        setVisibility(workspace.visibility || 'private');
      } else {
        setActiveWorkspace(workspaces[0]);
        navigate(`/dashboard/workspace/${workspaces[0].slug}/settings`, { replace: true });
      }
    }
  }, [slug, workspaces, setActiveWorkspace, navigate]);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Workspace name cannot be empty");
    if (!activeWorkspace) return;

    setIsSaving(true);
    try {
      await updateWorkspace(activeWorkspace.id, {
        name: name.trim(),
        visibility
      });
      toast.success("Workspace updated successfully");
    } catch (error) {
      // toast is handled in store
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== activeWorkspace.name) {
      return toast.error("Please type the workspace name correctly to confirm");
    }

    setIsDeleting(true);
    try {
      await deleteWorkspace(activeWorkspace.id);
      toast.success("Workspace deleted successfully");
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // toast is handled in store
    } finally {
      setIsDeleting(false);
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-10 h-10 text-[#3ecf8e] animate-spin" />
      </div>
    );
  }

  const isOwner = activeWorkspace.ownerId === authUser?.id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 selection:bg-[#3ecf8e]/30 selection:text-[#fafafa]">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-medium text-[#fafafa] tracking-tight flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#3ecf8e]/10 flex items-center justify-center border border-[#3ecf8e]/20">
            <Settings className="w-6 h-6 text-[#3ecf8e]" />
          </div>
          Workspace Settings
        </h1>
        <p className="text-[#898989] mt-3 font-normal ml-16 text-[14px]">
          Configure preferences and access levels for your workspace
        </p>
      </div>

      <div className="space-y-10">
        {/* General Settings */}
        <section className="bg-[#1c1c1c] border border-[#242424] rounded-xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Info className="w-4 h-4 text-blue-500" />
            </div>
            <h2 className="text-lg font-medium text-[#fafafa] tracking-tight">General Information</h2>
          </div>

          <div className="grid gap-8 max-w-2xl">
            <div className="space-y-2">
              <label className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#898989] ml-1">Workspace Name</label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workspace name"
                className="bg-[#171717] border-[#2e2e2e] focus:border-[#3ecf8e]/50 h-12 rounded-lg text-[#fafafa] placeholder:text-[#4d4d4d]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#898989] ml-1">Workspace Slug (URL)</label>
              <div className="flex items-center gap-3 bg-[#171717] border border-[#2e2e2e] h-12 rounded-lg px-4 text-[#4d4d4d] font-normal select-none cursor-not-allowed">
                <span>collabdocs.com/workspace/</span>
                <span className="text-[#898989]">{activeWorkspace.slug}</span>
              </div>
              <p className="text-[11px] text-[#4d4d4d] font-normal mt-2 ml-1 flex items-center gap-1.5">
                <Info className="w-3 h-3" /> Slugs are permanent and cannot be changed after creation.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy & Visibility */}
        <section className="bg-[#1c1c1c] border border-[#242424] rounded-xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <Lock className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="text-lg font-medium text-[#fafafa] tracking-tight">Privacy & Visibility</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { id: 'private', label: 'Private', icon: Lock, desc: 'Only members can access' },
              { id: 'team', label: 'Team', icon: Users, desc: 'Anyone with a link can join' },
              { id: 'public', label: 'Public', icon: Globe, desc: 'Visible to everyone' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setVisibility(option.id)}
                className={`flex flex-col items-start p-5 rounded-lg border transition-all text-left group cursor-pointer
                  ${visibility === option.id 
                    ? 'bg-[#3ecf8e]/10 border-[#3ecf8e] shadow-sm' 
                    : 'bg-[#171717] border-[#2e2e2e] hover:border-[#4d4d4d]'
                  }`}
              >
                <option.icon className={`w-5 h-5 mb-3 transition-colors ${visibility === option.id ? 'text-[#3ecf8e]' : 'text-[#4d4d4d] group-hover:text-[#fafafa]'}`} />
                <span className={`text-sm font-medium mb-1 ${visibility === option.id ? 'text-[#fafafa]' : 'text-[#898989]'}`}>{option.label}</span>
                <span className="text-[11px] text-[#4d4d4d] font-normal leading-tight">{option.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Save Changes Button */}
        <div className="flex items-center justify-end">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#3ecf8e] hover:bg-[#00c573] text-[#171717] rounded-lg h-12 px-8 font-medium text-sm tracking-tight border-none cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        {/* Danger Zone */}
        {isOwner && !activeWorkspace.isPersonal && (
          <>
            <Separator className="bg-[#2e2e2e] my-8" />
            <section className="bg-red-500/5 border border-red-500/20 rounded-xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-lg font-medium text-red-500 tracking-tight">Danger Zone</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-red-500/10 border border-red-500/10 p-5 rounded-lg">
                  <h3 className="text-[#fafafa] font-medium text-sm mb-1 uppercase tracking-wider">Delete this workspace</h3>
                  <p className="text-red-500/70 text-[12px] font-normal leading-relaxed">
                    Once you delete a workspace, there is no going back. All documents and data associated with this workspace will be permanently erased.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-[11px] text-[#4d4d4d] font-medium uppercase tracking-[1.2px] px-1">
                    Type <span className="text-[#fafafa]">"{activeWorkspace.name}"</span> to confirm
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input 
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="Type workspace name here"
                      className="bg-[#171717] border-red-500/20 focus:border-red-500/50 h-12 rounded-lg text-[#fafafa] placeholder:text-[#2e2e2e]"
                    />
                    <Button 
                      onClick={handleDelete}
                      disabled={isDeleting || deleteConfirm !== activeWorkspace.name}
                      variant="destructive"
                      className="h-12 rounded-lg px-8 font-medium text-xs uppercase tracking-[1.2px] cursor-pointer"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                      Delete Workspace
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeWorkspace.isPersonal && (
          <div className="bg-[#3ecf8e]/5 border border-[#3ecf8e]/10 p-6 rounded-xl flex items-center gap-5">
            <div className="w-10 h-10 rounded-lg bg-[#3ecf8e]/10 flex items-center justify-center border border-[#3ecf8e]/20 flex-shrink-0">
              <Shield className="w-5 h-5 text-[#3ecf8e]" />
            </div>
            <div>
              <h4 className="text-[#fafafa] font-medium text-sm tracking-tight">Personal Workspace</h4>
              <p className="text-[#898989] text-[12px] mt-1 font-normal">This is your default workspace and cannot be deleted.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceSettings;
