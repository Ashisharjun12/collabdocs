import React, { useState, useRef } from 'react';
import Avvvatars from 'avvvatars-react';
import { Upload, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { uploadApi } from '../../services/api';
import axios from 'axios';

const LogoPicker = ({ value, onChange, logoType, onTypeChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(logoType === 'custom' ? value : null);
  const fileInputRef = useRef(null);

  const handleRefresh = () => {
    const randomString = Math.random().toString(36).substring(7);
    onChange(randomString);
    onTypeChange('generated');
    setPreview(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("File size must be less than 2MB");
    }

    setIsUploading(true);
    try {
      // 1. Get Presigned URL
      const { data } = await uploadApi.getPresignedUrl({
        filename: file.name,
        contentType: file.type
      });

      const { uploadUrl, publicUrl, uploadId } = data.data;

      // 2. Upload directly to S3/R2
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type }
      });

      // 3. Complete/Finalize upload in backend
      await uploadApi.completeUpload({ uploadId });

      setPreview(publicUrl);
      onChange(publicUrl);
      onTypeChange('custom');
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Workspace Icon</label>
      <div className="flex items-center gap-5">
        <div className="relative group">
          <div 
            className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#1e2130] bg-[#13151f] flex items-center justify-center cursor-pointer relative"
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                <Loader2 className="w-5 h-5 text-[#1D9E75] animate-spin" />
              </div>
            ) : null}

            {logoType === 'generated' ? (
              <Avvvatars value={value} style="shape" size={64} />
            ) : (
              <img src={preview} alt="Logo" className="w-full h-full object-cover" />
            )}
          </div>
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-full pointer-events-none group-hover:pointer-events-auto">
            {!isUploading && (
              <>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
                  className="p-1.5 hover:bg-white/20 rounded-full text-white transition-colors"
                  title="Generate new"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[11px] text-slate-400 font-medium">
            {logoType === 'generated' ? "auto-generated identity" : "custom brand logo"}
          </p>
          <div className="flex gap-2 mt-1">
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              disabled={isUploading}
              onClick={handleRefresh}
              className="h-9 text-[12px] px-4 bg-[#13151f] border-[#1e2130] text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> refresh
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-9 text-[12px] px-4 bg-[#13151f] border-[#1e2130] text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-all flex items-center gap-2"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              upload
            </Button>
          </div>
        </div>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
};

export default LogoPicker;
