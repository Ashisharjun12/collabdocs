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
  FileUp,
  Files,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadApi, docApi } from '../../../services/api';
import { useWorkspaceStore } from '../../../store/workspace-store';
import { format, formatDistanceToNow } from 'date-fns';
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
  const [activeTab, setActiveTab] = useState('docs');
  const [files, setFiles] = useState([]);
  const [docs, setDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();
  const { slug, docId: currentDocId } = useParams();
  const { workspaces } = useWorkspaceStore();

  const workspaceId = propWorkspaceId || workspaces.find(w => w.slug === slug)?.id;

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'files' || activeTab === 'recent') fetchFiles();
      if (activeTab === 'docs') fetchDocs();
    }
  }, [isOpen, activeTab, workspaceId]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await uploadApi.getFiles(1, 50);
      setFiles(response.data.data.data || []);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const fetchDocs = async () => {
    if (!workspaceId) return;
    try {
      setIsLoading(true);
      const response = await docApi.getDocsByWorkspace(workspaceId);
      // Correcting key from documents -> docs
      setDocs(response.data.data.docs || []);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleUploadAndImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isDocument = file.type.includes('pdf') || file.type.includes('word') || file.type.includes('text') || file.name.endsWith('.md');
    const toastId = toast.loading(isDocument ? `Converting ${file.name}...` : `Uploading ${file.name}...`);
    
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // 1. Initiate Multipart
      const initRes = await uploadApi.initiateMultipart({ 
        filename: file.name, 
        contentType: file.type || 'application/octet-stream' 
      });
      const { uploadId: dbUploadId } = initRes.data.data;

      // 2. Upload Chunks
      const CHUNK_SIZE = 5 * 1024 * 1024;
      const totalParts = Math.ceil(file.size / CHUNK_SIZE);
      const parts = [];
      for (let i = 1; i <= totalParts; i++) {
        const chunk = file.slice((i - 1) * CHUNK_SIZE, Math.min(i * CHUNK_SIZE, file.size));
        const partUrlRes = await uploadApi.getMultipartPartUrl({ uploadId: dbUploadId, partNumber: i });
        const uploadRes = await axios.put(partUrlRes.data.data.url, chunk);
        parts.push({ ETag: uploadRes.headers.etag.replace(/"/g, ''), PartNumber: i });
        setUploadProgress(Math.round((i / totalParts) * 100));
      }

      // 3. Complete Multipart
      const completeRes = await uploadApi.completeMultipart({ uploadId: dbUploadId, parts });
      const uploadedFile = completeRes.data.data;

      if (isDocument) {
        toast.loading("Invoking Converter Service...", { id: toastId });
        const importRes = await docApi.importFromFile({ 
          fileKey: uploadedFile.key, 
          workspaceId, 
          title: file.name.split('.')[0] 
        });
        const newDoc = importRes.data.data.doc || importRes.data.data.document;
        toast.success("Document Generated!", { id: toastId });
        onClose();
        navigate(`/dashboard/workspace/${slug}/doc/${newDoc.id}`);
      } else {
        toast.success("File stored in Vault!", { id: toastId });
        fetchFiles();
        setActiveTab('files');
      }
    } catch (error) { 
      console.error(error);
      toast.error("Process failed", { id: toastId }); 
    } finally { 
      setIsUploading(false); 
      setUploadProgress(0); 
    }
  };

  const handleImportToEditor = async (e, file) => {
    e.stopPropagation();
    if (isImporting || !workspaceId) return;
    const toastId = toast.loading(`Converting ${file.filename}...`);
    try {
      setIsImporting(true);
      const response = await docApi.importFromFile({ 
        fileKey: file.key, 
        workspaceId, 
        title: file.filename.split('.')[0] 
      });
      const newDoc = response.data.data.document || response.data.data.doc;
      toast.success("Import successful!", { id: toastId });
      onClose();
      const targetSlug = slug || workspaces.find(w => w.id === workspaceId)?.slug;
      if (targetSlug && newDoc.id) navigate(`/dashboard/workspace/${targetSlug}/doc/${newDoc.id}`);
    } catch (error) { 
      toast.error("Conversion failed", { id: toastId }); 
    } finally { 
      setIsImporting(false); 
    }
  };

  const handleDelete = async (e, key) => {
    e.stopPropagation();
    if (!window.confirm("Delete permanently?")) return;
    try {
      await uploadApi.deleteFile(encodeURIComponent(key));
      setFiles(prev => prev.filter(f => f.key !== key));
      if (previewFile?.key === key) setPreviewFile(null);
    } catch (error) { console.error(error); }
  };

  const filteredFiles = files.filter(f => (f.filename || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDocs = docs.filter(d => (d.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase()) && d.id !== currentDocId);

  const tabs = [
    { id: 'docs', label: 'Documents', icon: <Files className="w-3.5 h-3.5" /> },
    { id: 'files', label: 'Vault', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'upload', label: 'Converter', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#050608]/90 backdrop-blur-xl" />
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-3xl max-h-[85vh] bg-[#171717] border border-[#2e2e2e] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
            <div className="px-8 pt-8 flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 flex items-center justify-center text-[#3ecf8e]">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#fafafa] tracking-tight">Open Document</h2>
                    <p className="text-xs text-[#4d4d4d] font-medium tracking-tight">Unified Workspace Browser</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-[#1c1c1c] rounded-xl text-[#4d4d4d] hover:text-[#fafafa] transition-all cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex items-center gap-10 border-b border-[#2e2e2e] mb-6">
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} className={`relative py-4 text-[10px] font-bold uppercase tracking-[2px] transition-all flex items-center gap-2.5 cursor-pointer ${activeTab === t.id ? 'text-[#3ecf8e]' : 'text-[#4d4d4d] hover:text-[#fafafa]'}`}>
                    {t.icon} {t.label}
                    {activeTab === t.id && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3ecf8e] shadow-[0_0_10px_#3ecf8e/50]" />}
                  </button>
                ))}
              </div>

              <div className="mb-6 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4d4d] group-focus-within:text-[#3ecf8e] transition-colors" />
                <input type="text" placeholder={`Search ${activeTab === 'docs' ? 'active documents' : 'vault assets'}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-2xl py-4 pl-12 pr-4 text-[13px] text-[#fafafa] focus:outline-none focus:border-[#3ecf8e]/40 transition-all placeholder:text-[#4d4d4d] shadow-inner" />
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-8">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-[#4d4d4d]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#3ecf8e]/60" />
                    <span className="text-[10px] font-bold uppercase tracking-[3px]">Mapping Workspace</span>
                  </div>
                ) : activeTab === 'upload' ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8">
                    <div className={`w-full h-full border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${isUploading ? 'border-[#3ecf8e]/40 bg-[#3ecf8e]/5' : 'border-[#2e2e2e] hover:border-[#3ecf8e]/20 bg-[#1c1c1c]/30'}`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleUploadAndImport({ target: { files: e.dataTransfer.files } }); }}>
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-4 text-center px-10">
                          <Loader2 className="w-10 h-10 text-[#3ecf8e] animate-spin" />
                          <div className="space-y-2">
                             <p className="text-[10px] font-bold text-[#fafafa] uppercase tracking-widest">{uploadProgress}% SYNCED</p>
                             <p className="text-[9px] text-[#4d4d4d] font-bold uppercase tracking-widest">Processing through converter service...</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <CloudUpload className="w-12 h-12 text-[#2e2e2e] mb-6" />
                          <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3 bg-[#171717] hover:bg-[#1c1c1c] border border-[#2e2e2e] text-[#fafafa] rounded-2xl text-[10px] font-bold uppercase tracking-[2px] transition-all cursor-pointer">Choose PDF or DOCX</button>
                          <p className="mt-4 text-[10px] text-[#4d4d4d] font-bold uppercase tracking-widest">Immediate conversion to editor format</p>
                        </>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleUploadAndImport} />
                  </div>
                ) : activeTab === 'docs' ? (
                  <div className="grid grid-cols-1 gap-2.5">
                    {filteredDocs.map(d => (
                      <button key={d.id} onClick={() => { onClose(); navigate(`/dashboard/workspace/${slug}/doc/${d.id}`); }} className="w-full flex items-center justify-between p-4 bg-[#1c1c1c]/30 hover:bg-[#1c1c1c] border border-transparent hover:border-[#2e2e2e] rounded-2xl transition-all group cursor-pointer">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-[#171717] border border-[#2e2e2e] flex items-center justify-center group-hover:bg-[#3ecf8e]/10 group-hover:border-[#3ecf8e]/20 transition-all text-[#4d4d4d] group-hover:text-[#3ecf8e]">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="text-left min-w-0">
                            <h4 className="text-[13px] font-medium text-[#fafafa] truncate group-hover:text-[#3ecf8e] transition-colors">{d.title || "Untitled"}</h4>
                            <p className="text-[9px] text-[#4d4d4d] font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Edited {formatDistanceToNow(new Date(d.updatedAt), { addSuffix: true })}</p>
                          </div>
                        </div>
                        <ChevronLeft className="w-4 h-4 rotate-180 text-[#2e2e2e] group-hover:text-[#fafafa] transition-all" />
                      </button>
                    ))}
                    {filteredDocs.length === 0 && <div className="py-20 text-center text-[#4d4d4d] text-xs font-medium tracking-tight">Workspace index is empty.</div>}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {filteredFiles.map(f => {
                      const config = getFileConfig(f.mimeType);
                      const isImportable = f.mimeType?.includes('pdf') || f.mimeType?.includes('word') || f.mimeType?.includes('text');
                      return (
                        <div key={f.id} onClick={e => isImportable ? handleImportToEditor(e, f) : setPreviewFile(f)} className="group bg-[#1c1c1c]/30 hover:bg-[#1c1c1c] border border-[#2e2e2e] hover:border-[#3ecf8e]/30 rounded-2xl transition-all cursor-pointer overflow-hidden relative shadow-inner">
                          <div className="aspect-[4/3] bg-black/20 flex items-center justify-center relative overflow-hidden">
                            {f.mimeType?.includes('image') ? <img src={f.publicUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className={`w-full h-full flex items-center justify-center ${config.color}`}>{config.icon}</div>}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-[-10px] group-hover:translate-y-0">
                              {isImportable && <button onClick={e => handleImportToEditor(e, f)} className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-[#3ecf8e] hover:scale-110 transition-all"><FileUp className="w-3.5 h-3.5" /></button>}
                              <button onClick={e => handleDelete(e, f.key)} className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-red-400 hover:scale-110 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                          <div className="p-3.5">
                            <h4 className="text-[11px] font-medium text-[#fafafa] truncate mb-1">{f.filename}</h4>
                            <p className="text-[8px] text-[#4d4d4d] font-bold uppercase tracking-widest">{(f.size / 1024 / 1024).toFixed(1)} MB</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="px-8 py-5 border-t border-[#2e2e2e] bg-[#1c1c1c]/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[9px] font-bold text-[#4d4d4d] uppercase tracking-[2px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3ecf8e]/60" /> Conversion Backend Ready
              </div>
              <div className="text-[9px] font-bold text-[#3ecf8e] uppercase tracking-[2px]">{activeTab === 'docs' ? docs.length : files.length} Resources Tracked</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default MediaLibraryModal;
