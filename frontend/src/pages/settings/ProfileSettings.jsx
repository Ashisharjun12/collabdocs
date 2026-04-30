import React, { useRef, useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth-store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { uploadApi, userApi } from '../../services/api';
import { toast } from 'sonner';
import { Loader2, Camera, Trash2, Save, X } from 'lucide-react';

const ProfileSettings = () => {
  const { authUser, setAuthUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  
  const [name, setName] = useState(authUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(authUser?.avatarUrl || '');

  // Keep local state in sync with store if authUser changes
  useEffect(() => {
    if (authUser) {
      setName(authUser.name || '');
      setAvatarUrl(authUser.avatarUrl || '');
    }
  }, [authUser]);

  // Helper to extract R2 key from public URL
  const getR2KeyFromUrl = (url) => {
    if (!url || !url.includes('/uploads/')) return null;
    const parts = url.split('/uploads/');
    return 'uploads/' + parts[1];
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        return toast.error("Please upload an image file");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File size must be less than 5MB");
    }

    setIsUploading(true);
    const loadingToast = toast.loading("Uploading photo...");
    
    try {
      // 1. Get presigned URL
      const response = await uploadApi.getPresignedUrl({
        filename: file.name,
        contentType: file.type
      });
      
      const { uploadUrl, uploadId, publicUrl } = response.data.data;

      // 2. Upload to R2
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
        mode: 'cors',
        credentials: 'omit'
      });

      // 3. Mark upload as complete
      await uploadApi.completeUpload({ uploadId });

      // 4. Update local preview ONLY (User must click Save)
      setAvatarUrl(publicUrl);
      toast.success("Photo uploaded! Click 'Save Changes' to confirm.", { id: loadingToast });
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload photo", { id: loadingToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    if (!avatarUrl) return;
    setAvatarUrl('');
    toast.info("Photo removed locally. Click 'Save Changes' to confirm.");
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name cannot be empty");
    
    setIsSaving(true);
    const loadingToast = toast.loading("Saving changes...");
    try {
      // 1. Update the profile
      const response = await userApi.updateProfile({
        name: name.trim(),
        avatarUrl: avatarUrl,
        version: authUser.version
      });
      
      // 2. CLEANUP: If the avatar changed, delete the old one from R2
      if (avatarUrl !== authUser?.avatarUrl && authUser?.avatarUrl) {
        const oldKey = getR2KeyFromUrl(authUser.avatarUrl);
        if (oldKey) {
            // Delete old file in background
            uploadApi.deleteFile(encodeURIComponent(oldKey)).catch(err => {
                console.error("Cleanup failed for old avatar:", err);
            });
        }
      }

      const { user, accessToken } = response.data.data;
      setAuthUser(user, accessToken);
      toast.success("Profile updated successfully!", { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setName(authUser?.name || '');
    setAvatarUrl(authUser?.avatarUrl || '');
    toast.info("Changes discarded");
  };

  const hasChanges = name !== authUser?.name || avatarUrl !== authUser?.avatarUrl;


  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Profile Settings</h1>
        <p className="text-slate-500 text-sm">Manage your public profile and account details.</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-[#13151f]/50 backdrop-blur-sm border border-[#1e2130] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1D9E75]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-10">
            <div className="relative group">
                <Avatar className="w-28 h-28 ring-4 ring-[#1D9E75]/10 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <AvatarImage src={avatarUrl} className="object-cover" />

                    <AvatarFallback className="bg-[#1D9E75] text-white text-4xl font-bold">
                        {name?.substring(0, 2).toUpperCase() || 'AD'}
                    </AvatarFallback>
                </Avatar>

                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                   <span className="text-[10px] text-white font-bold uppercase tracking-wider bg-[#1D9E75] px-2 py-1 rounded">Change</span>
                </div>

                
                {isUploading && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center z-10 animate-in fade-in">
                        <Loader2 className="w-8 h-8 text-[#1D9E75] animate-spin mb-1" />
                        <span className="text-[10px] text-white font-bold uppercase tracking-widest">Uploading</span>
                    </div>
                )}
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 w-9 h-9 bg-[#1D9E75] hover:bg-[#168a65] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#13151f] transition-all hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50"
                    title="Change Photo"
                >
                    <Camera className="w-4 h-4" />
                </button>
            </div>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Upload a professional photo. JPG, PNG or WebP allowed. Max 5MB.
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                    variant="outline"
                    className="border-[#1e2130] text-red-400 hover:text-red-300 hover:bg-red-400/5 h-9 px-4 gap-2 border-dashed"
                    onClick={handleRemovePhoto}
                    disabled={!avatarUrl || isSaving}

                >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Photo</span>
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-[#1e2130] mb-10" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Display Name</label>
              <div className="relative group">
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#0f1117] border-[#2a2d3a] text-white focus:border-[#1D9E75] h-12 px-4 rounded-xl transition-all focus:ring-1 focus:ring-[#1D9E75]/20 placeholder:text-slate-600 outline-none"
                  placeholder="How should we call you?"
                />
              </div>
              <p className="text-[11px] text-slate-600 ml-1">Your name will be visible to collaborators.</p>
            </div>
            
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Registered Email</label>
              <Input 
                value={authUser?.email} 
                disabled
                className="bg-[#0f1117]/30 border-[#1e2130] text-slate-600 cursor-not-allowed h-12 px-4 rounded-xl"
              />
              <p className="text-[11px] text-slate-600 ml-1 italic">Email cannot be changed for security.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-12 pt-8 border-t border-[#1e2130]">
            <Button 
                variant="ghost" 
                className="text-slate-500 hover:text-white h-11 px-8 gap-2 hover:bg-[#1a1d28] rounded-xl transition-colors"
                onClick={handleDiscard}
            >
                <X className="w-4 h-4" />
                <span>Discard Changes</span>
            </Button>
            <Button 
                className="bg-[#1D9E75] hover:bg-[#168a65] text-white px-10 h-11 font-bold shadow-xl shadow-[#1D9E75]/20 rounded-xl gap-2 transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                onClick={handleSave}
                disabled={isSaving || isUploading || !hasChanges}
            >
                {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
