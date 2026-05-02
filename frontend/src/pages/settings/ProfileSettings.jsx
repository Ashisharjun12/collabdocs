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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-medium text-[#fafafa] mb-1.5 tracking-tight">Profile Settings</h1>
        <p className="text-[#898989] text-sm">Manage your personal information and profile picture.</p>
      </div>

      <div className="grid gap-8">
        <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden group/card">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3ecf8e]/5 rounded-full blur-[100px] pointer-events-none group-hover/card:bg-[#3ecf8e]/10 transition-colors duration-700"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-10 mb-12">
            <div className="relative group/avatar">
                <Avatar 
                  className="w-32 h-32 ring-4 ring-[#2e2e2e] group-hover/avatar:ring-[#3ecf8e]/20 shadow-2xl transition-all duration-500 cursor-pointer" 
                  onClick={() => fileInputRef.current?.click()}
                >
                    <AvatarImage src={avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-[#171717] text-[#3ecf8e] text-4xl font-medium border border-[#2e2e2e]">
                        {name?.substring(0, 1).toUpperCase() || 'U'}
                    </AvatarFallback>
                </Avatar>

                {isUploading && (
                    <div className="absolute inset-0 bg-[#171717]/80 rounded-full flex flex-col items-center justify-center z-10 animate-in fade-in">
                        <Loader2 className="w-8 h-8 text-[#3ecf8e] animate-spin mb-1.5" />
                        <span className="text-[10px] text-[#fafafa] font-bold uppercase tracking-widest">Uploading</span>
                    </div>
                )}
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-[#3ecf8e] hover:bg-[#34b27b] text-[#171717] rounded-lg flex items-center justify-center shadow-xl border-4 border-[#1c1c1c] transition-all hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50 z-20"
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
                <h3 className="text-xl font-medium text-[#fafafa] tracking-tight">Profile Picture</h3>
                <p className="text-sm text-[#898989] mt-1.5 max-w-xs leading-relaxed">
                  Upload a new photo for your profile. <br />
                  <span className="text-xs">Supports JPG, PNG or WebP. Max 5MB.</span>
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                    variant="outline"
                    className="bg-[#171717] border-[#2e2e2e] text-red-500/80 hover:text-red-500 hover:bg-red-500/5 h-10 px-5 gap-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                    onClick={handleRemovePhoto}
                    disabled={!avatarUrl || isSaving}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-[#2e2e2e] mb-12 opacity-50" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-medium text-[#4d4d4d] uppercase tracking-[1.5px] ml-1">Full Display Name</label>
              <div className="relative group">
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#171717] border border-[#2e2e2e] text-[#fafafa] focus:border-[#3ecf8e] focus-visible:ring-[#3ecf8e]/20 h-12 px-5 rounded-lg transition-all placeholder:text-[#4d4d4d] font-medium"
                  placeholder="How should we call you?"
                />
              </div>
              <p className="text-[11px] text-[#4d4d4d] ml-1">Your name will be visible to collaborators in workspaces.</p>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-medium text-[#4d4d4d] uppercase tracking-[1.5px] ml-1">Registered Email</label>
              <Input 
                value={authUser?.email} 
                disabled
                className="bg-[#171717]/50 border border-[#2e2e2e] text-[#4d4d4d] cursor-not-allowed h-12 px-5 rounded-lg font-medium opacity-60"
              />
              <p className="text-[11px] text-[#4d4d4d] ml-1 italic">Email cannot be changed for security.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-16 pt-10 border-t border-[#2e2e2e]">
            <Button 
                variant="ghost" 
                className="text-[#898989] hover:text-[#fafafa] h-11 px-8 gap-2.5 hover:bg-[#242424] rounded-lg transition-all font-medium text-sm cursor-pointer"
                onClick={handleDiscard}
            >
                <X className="w-4 h-4" />
                <span>Discard Changes</span>
            </Button>
            <Button 
                className="bg-[#3ecf8e] hover:bg-[#34b27b] text-[#171717] px-10 h-11 font-bold shadow-xl shadow-[#3ecf8e]/10 rounded-lg gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] border-none cursor-pointer"
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
