import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { 
  X, 
  Upload, 
  FileText, 
  FileCode, 
  Presentation, 
  Search, 
  Trash2, 
  Download, 
  Loader2,
  File,
  CheckCircle2,
  History,
  LayoutGrid,
  CloudUpload,
  ChevronLeft,
  ExternalLink,
  Eye,
  FileUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadApi, docApi } from '../../../services/api';
import { useWorkspaceStore } from '../../../store/workspace-store';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

const FILE_TYPE_CONFIG = {
  'application/pdf': { icon: <FileText className="w-5 h-5 text-red-500" />, label: 'PDF', color: 'bg-red-500/5' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: <FileText className="w-5 h-5 text-blue-500" />, label: 'DOCX', color: 'bg-blue-500/5' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: <Presentation className="w-5 h-5 text-orange-500" />, label: 'PPTX', color: 'bg-orange-500/5' },
  'text/markdown': { icon: <FileCode className="w-5 h-5 text-purple-500" />, label: 'MD', color: 'bg-purple-500/5' },
  'text/plain': { icon: <FileText className="w-5 h-5 text-slate-400" />, label: 'TXT', color: 'bg-slate-500/5' },
  'image/jpeg': { icon: <File className="w-5 h-5 text-pink-500" />, label: 'IMG', color: 'bg-pink-500/5' },
  'image/png': { icon: <File className="w-5 h-5 text-pink-500" />, label: 'IMG', color: 'bg-pink-500/5' },
};

const getFileConfig = (mimeType) => {
  return FILE_TYPE_CONFIG[mimeType] || { icon: <File className="w-5 h-5 text-slate-500" />, label: 'FILE', color: 'bg-slate-500/5' };
};

const MediaLibraryModal = ({ isOpen, onClose, workspaceId: propWorkspaceId }) => {
  const [activeTab, setActiveTab] = useState('files');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();
  const { slug } = useParams();
  const { workspaces } = useWorkspaceStore();

  // Resolve the workspace ID: Priority to prop, then fallback to slug lookup
  const workspaceId = propWorkspaceId || workspaces.find(w => w.slug === slug)?.id;

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await uploadApi.getFiles(1, 50);
      const fileList = response.data.data.data || [];
      setFiles(fileList);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error("File is too large (max 100MB)");
      return;
    }

    const toastId = toast.loading(`Uploading ${file.name}...`);
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const initRes = await uploadApi.initiateMultipart({ 
        filename: file.name, 
        contentType: file.type || 'application/octet-stream' 
      });
      const { uploadId: dbUploadId } = initRes.data.data;
      
      setUploadProgress(10);

      const CHUNK_SIZE = 5 * 1024 * 1024;
      const totalParts = Math.ceil(file.size / CHUNK_SIZE);
      const parts = [];

      for (let i = 1; i <= totalParts; i++) {
        const start = (i - 1) * CHUNK_SIZE;
        const end = Math.min(i * CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const partUrlRes = await uploadApi.getMultipartPartUrl({ 
          uploadId: dbUploadId, 
          partNumber: i 
        });
        const partUrl = partUrlRes.data.data.url;

        const uploadRes = await axios.put(partUrl, chunk, {
          headers: { 'Content-Type': file.type || 'application/octet-stream' }
        });

        const etag = uploadRes.headers.etag;
        parts.push({ ETag: etag.replace(/"/g, ''), PartNumber: i });
        setUploadProgress(Math.round(10 + (i / totalParts) * 80));
      }

      await uploadApi.completeMultipart({ uploadId: dbUploadId, parts });
      toast.success("File uploaded successfully!", { id: toastId });
      fetchFiles();
      setActiveTab('files');
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed", { id: toastId });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e, key) => {
    e.stopPropagation();
    if (!window.confirm("Delete this file?")) return;
    const toastId = toast.loading("Deleting file...");
    try {
      await uploadApi.deleteFile(encodeURIComponent(key));
      toast.success("File deleted", { id: toastId });
      setFiles(prev => prev.filter(f => f.key !== key));
      if (previewFile?.key === key) setPreviewFile(null);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Delete failed", { id: toastId });
    }
  };

  const handleImportToEditor = async (e, file) => {
    e.stopPropagation();
    if (isImporting) return;
    
    if (!workspaceId) {
      toast.error("Please select a workspace first");
      return;
    }

    const toastId = toast.loading(`Importing ${file.filename}...`);
    try {
      setIsImporting(true);
      const response = await docApi.importFromFile({
        fileKey: file.key,
        workspaceId,
        title: file.filename.split('.')[0]
      });

      const newDoc = response.data.data.doc;
      toast.success("Import started! Redirecting...", { id: toastId });
      
      // Resolve the slug for the redirect - Check props, then store
      const effectiveWorkspaceId = propWorkspaceId || workspaceId;
      const targetSlug = slug || workspaces.find(w => w.id === effectiveWorkspaceId)?.slug;

      // Close modal and navigate to the new document using the correct nested route
      onClose();
      if (targetSlug && newDoc.id) {
        navigate(`/dashboard/workspace/${targetSlug}/doc/${newDoc.id}`);
      } else {
        console.error("Missing navigation params:", { targetSlug, docId: newDoc.id });
        toast.error("Could not redirect, but import is running.");
      }
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Failed to import document", { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  const filteredFiles = files.filter(file => 
    (file.filename || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'recent', label: 'Recent', icon: <History className="w-3.5 h-3.5" /> },
    { id: 'files', label: 'Vault', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'upload', label: 'Upload', icon: <Upload className="w-3.5 h-3.5" /> },
  ];

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#050608]/85 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-[#0a0b10] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {previewFile ? (
                /* PREVIEW OVERLAY */
                <motion.div 
                  key="preview"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute inset-0 z-50 bg-[#0a0b10] flex flex-col"
                >
                  <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <button 
                      onClick={() => setPreviewFile(null)}
                      className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => handleImportToEditor(e, previewFile)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#1D9E75]/10 hover:bg-[#1D9E75]/20 text-[#1D9E75] rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        Import to Editor
                      </button>
                      <a href={previewFile.publicUrl} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all cursor-pointer"><ExternalLink className="w-4 h-4" /></a>
                      <button onClick={(e) => handleDelete(e, previewFile.key)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-500 transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden p-6 flex flex-col items-center justify-center bg-black/40">
                    {previewFile.mimeType?.includes('image') ? (
                      <img src={previewFile.publicUrl} alt={previewFile.filename} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/5" />
                    ) : previewFile.mimeType?.includes('pdf') ? (
                      <iframe src={`${previewFile.publicUrl}#toolbar=0`} className="w-full h-full rounded-xl border border-white/5 bg-white/5" title="PDF Preview" />
                    ) : (
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-slate-700" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-sm font-bold text-white mb-1">{previewFile.filename}</h3>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Preview not available</p>
                        </div>
                        <button onClick={(e) => handleImportToEditor(e, previewFile)} className="px-6 py-2.5 bg-[#1D9E75] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer">Import to Editor</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* MAIN GRID VIEW */
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="px-6 pt-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#1D9E75] shadow-[0_0_8px_#1D9E75]" />
                        Vault Browser
                      </h2>
                      <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all cursor-pointer"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="flex items-center gap-8 border-b border-white/5">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`relative py-3 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${activeTab === tab.id ? 'text-[#1D9E75]' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {tab.icon}
                          {tab.label}
                          {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D9E75]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {activeTab === 'upload' ? (
                      <div className="h-full min-h-[300px] flex flex-col items-center justify-center">
                        <div 
                          className={`w-full p-10 border border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${isUploading ? 'border-[#1D9E75]/50 bg-[#1D9E75]/5' : 'border-white/5 hover:border-[#1D9E75]/20 bg-white/[0.01]'}`}
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#1D9E75'; }}
                          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                          onDrop={(e) => { e.preventDefault(); handleUpload({ target: { files: e.dataTransfer.files } }); }}
                        >
                          {isUploading ? (
                            <div className="flex flex-col items-center gap-4">
                              <Loader2 className="w-8 h-8 text-[#1D9E75] animate-spin" />
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{uploadProgress}% UPLOADING</p>
                            </div>
                          ) : (
                            <>
                              <CloudUpload className="w-10 h-10 text-slate-700 mb-6" />
                              <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer">Select File</button>
                            </>
                          )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-700" />
                          <input 
                            type="text" 
                            placeholder="FIND IN VAULT..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-[9px] font-bold text-slate-400 focus:outline-none focus:border-[#1D9E75]/20 transition-all placeholder:text-slate-800 tracking-[0.15em]"
                          />
                        </div>

                        {isLoading ? (
                          <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#1D9E75]/30" /></div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {filteredFiles.map((file) => {
                              const config = getFileConfig(file.mimeType);
                              const isImage = file.mimeType?.includes('image');
                              const isImportable = file.mimeType?.includes('pdf') || file.mimeType?.includes('word') || file.mimeType?.includes('text');
                              
                              return (
                                <motion.div 
                                  key={file.id} 
                                  layout
                                  onClick={(e) => {
                                    const isImportable = file.mimeType?.includes('pdf') || file.mimeType?.includes('word') || file.mimeType?.includes('text');
                                    if (isImportable) {
                                      handleImportToEditor(e, file);
                                    } else {
                                      setPreviewFile(file);
                                    }
                                  }}
                                  className="group flex flex-col bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-[#1D9E75]/30 rounded-xl transition-all cursor-pointer overflow-hidden"
                                >
                                  <div className="aspect-[4/3] bg-black/20 flex items-center justify-center overflow-hidden relative">
                                    {isImage ? (
                                      <img src={file.publicUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                      <div className={`w-full h-full flex items-center justify-center ${config.color}`}>
                                        {config.icon}
                                      </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {isImportable && (
                                        <button 
                                          onClick={(e) => handleImportToEditor(e, file)}
                                          className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-slate-400 hover:text-[#1D9E75] transition-all"
                                          title="Import to Editor"
                                        >
                                          <FileUp className="w-3 h-3" />
                                        </button>
                                      )}
                                      <button onClick={(e) => handleDelete(e, file.key)} className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                  </div>
                                  <div className="p-2.5">
                                    <h4 className="text-[10px] font-bold text-slate-300 truncate mb-1" title={file.filename}>{file.filename}</h4>
                                    <div className="flex items-center justify-between">
                                      <p className="text-[8px] text-slate-600 font-bold uppercase">{file.size ? (file.size / 1024 / 1024).toFixed(1) : '0'} MB</p>
                                      {file.status === 'pending' && <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-3 border-t border-white/5 bg-black/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-700 uppercase tracking-widest">
                      <CheckCircle2 className="w-3 h-3 text-[#1D9E75]/50" /> R2 VAULT ACTIVE
                    </div>
                    <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">{files.length} ASSETS</div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default MediaLibraryModal;
