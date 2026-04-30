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
        <Loader2 className="w-10 h-10 text-[#1D9E75] animate-spin" />
      </div>
    );
  }

  const isOwner = activeWorkspace.ownerId === authUser?.id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center border border-[#1D9E75]/20">
            <Settings className="w-6 h-6 text-[#1D9E75]" />
          </div>
          Workspace Settings
        </h1>
        <p className="text-slate-500 mt-2 font-medium ml-16">
          Configure preferences and access levels for your workspace
        </p>
      </div>

      <div className="space-y-12">
        {/* General Settings */}
        <section className="bg-[#13151f]/30 border border-[#1e2130] rounded-[32px] p-8 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-400/10 rounded-xl border border-blue-400/20">
              <Info className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">General Information</h2>
          </div>

          <div className="grid gap-8 max-w-2xl">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Workspace Name</label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workspace name"
                className="bg-[#0d0f18] border-[#1e2130] focus:border-[#1D9E75]/50 h-12 rounded-xl text-white font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Workspace Slug (URL)</label>
              <div className="flex items-center gap-3 bg-[#0d0f18] border border-[#1e2130] h-12 rounded-xl px-4 text-slate-500 font-bold select-none cursor-not-allowed">
                <span>collabdocs.com/workspace/</span>
                <span className="text-slate-300">{activeWorkspace.slug}</span>
              </div>
              <p className="text-[10px] text-slate-600 font-bold mt-1 ml-1 flex items-center gap-1">
                <Info className="w-3 h-3" /> Slugs are permanent and cannot be changed after creation.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy & Visibility */}
        <section className="bg-[#13151f]/30 border border-[#1e2130] rounded-[32px] p-8 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-400/10 rounded-xl border border-amber-400/20">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Privacy & Visibility</h2>
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
                className={`flex flex-col items-start p-5 rounded-2xl border transition-all text-left group
                  ${visibility === option.id 
                    ? 'bg-[#1D9E75]/10 border-[#1D9E75] ring-4 ring-[#1D9E75]/5' 
                    : 'bg-[#0d0f18] border-[#1e2130] hover:border-[#1D9E75]/30'
                  }`}
              >
                <option.icon className={`w-5 h-5 mb-3 transition-colors ${visibility === option.id ? 'text-[#1D9E75]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className={`text-sm font-bold mb-1 ${visibility === option.id ? 'text-white' : 'text-slate-400'}`}>{option.label}</span>
                <span className="text-[11px] text-slate-500 font-medium leading-tight">{option.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Save Changes Button */}
        <div className="flex items-center justify-end">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#1D9E75] hover:bg-[#1D9E75]/90 text-white rounded-2xl h-14 px-10 font-black text-sm tracking-tight shadow-lg shadow-[#1D9E75]/20 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Save Workspace Changes
          </Button>
        </div>

        {/* Danger Zone */}
        {isOwner && !activeWorkspace.isPersonal && (
          <>
            <Separator className="bg-[#1e2130] my-8" />
            <section className="bg-red-400/5 border border-red-400/20 rounded-[32px] p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-400/10 rounded-xl border border-red-400/20">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-red-400 tracking-tight">Danger Zone</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-red-400/10 border border-red-400/10 p-5 rounded-2xl">
                  <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Delete this workspace</h3>
                  <p className="text-red-400/70 text-xs font-medium leading-relaxed">
                    Once you delete a workspace, there is no going back. All documents and data associated with this workspace will be permanently erased.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest px-1">
                    Type <span className="text-white">"{activeWorkspace.name}"</span> to confirm
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input 
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="Type workspace name here"
                      className="bg-[#0d0f18] border-red-400/20 focus:border-red-400/50 h-12 rounded-xl text-white font-bold placeholder:text-slate-700"
                    />
                    <Button 
                      onClick={handleDelete}
                      disabled={isDeleting || deleteConfirm !== activeWorkspace.name}
                      variant="destructive"
                      className="h-12 rounded-xl px-8 font-black text-xs uppercase tracking-widest cursor-pointer"
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
          <div className="bg-[#1D9E75]/5 border border-[#1D9E75]/10 p-6 rounded-[32px] flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#1D9E75]/10 flex items-center justify-center border border-[#1D9E75]/20 flex-shrink-0">
              <Shield className="w-5 h-5 text-[#1D9E75]" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm tracking-tight">Personal Workspace</h4>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">This is your default workspace and cannot be deleted.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceSettings;
