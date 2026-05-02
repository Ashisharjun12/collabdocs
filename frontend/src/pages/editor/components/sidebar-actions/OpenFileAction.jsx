import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Search, 
  Loader2, 
  ChevronRight, 
  Clock, 
  Upload, 
  Plus,
  FileUp,
  AlertCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import SidebarItem from './SidebarItem';
import { useWorkspaceStore } from '../../../../store/workspace-store';
import { docApi } from '../../../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const OpenFileAction = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [docs, setDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const fileInputRef = useRef(null);
  const { docId: currentDocId, slug } = useParams();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (isOpen && activeWorkspace?.id) {
      fetchDocs();
    }
  }, [isOpen, activeWorkspace?.id]);

  const fetchDocs = async () => {
    try {
      setIsLoading(true);
      // Using listDocs assuming it's mapping to getDocsByWorkspace
      const response = await docApi.getDocsByWorkspace(activeWorkspace.id);
      setDocs(response.data.data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Support common document formats
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/plain', // .txt
      'text/markdown', // .md
      'application/pdf' // .pdf
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
      toast.error("Unsupported file format. Please upload .docx, .txt, .md, or .pdf");
      return;
    }

    try {
      setIsImporting(true);
      const toastId = toast.loading(`Importing ${file.name}...`);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspaceId', activeWorkspace.id);

      const response = await docApi.importFromFile(formData);
      const newDoc = response.data.data.document;
      
      toast.success("Document imported successfully!", { id: toastId });
      setIsOpen(false);
      navigate(`/dashboard/workspace/${slug}/doc/${newDoc.id}`);
    } catch (error) {
      console.error("Import failed:", error);
      toast.error(error.response?.data?.message || "Failed to import document");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredDocs = docs.filter(d => 
    (d.title || "Untitled").toLowerCase().includes(search.toLowerCase()) && d.id !== currentDocId
  );

  const handleOpenDoc = (id) => {
    setIsOpen(false);
    navigate(`/dashboard/workspace/${slug}/doc/${id}`);
  };

  return (
    <>
      <SidebarItem 
        icon={<FileText className="w-4 h-4" />} 
        label="Open File" 
        onClick={() => setIsOpen(true)}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#171717] border border-[#2e2e2e] text-[#fafafa] shadow-2xl sm:max-w-[580px] rounded-2xl p-0 overflow-hidden border-none focus:outline-none">
          <div className="p-8 pb-4">
            <DialogHeader className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3ecf8e]/10 flex items-center justify-center border border-[#3ecf8e]/20 text-[#3ecf8e]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold tracking-tight">Open Document</DialogTitle>
                    <p className="text-xs text-[#4d4d4d] font-medium tracking-tight mt-0.5">Browse or import files in {activeWorkspace?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".docx,.txt,.md,.pdf"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1c1c1c] border border-[#2e2e2e] hover:border-[#3ecf8e]/40 hover:bg-[#3ecf8e]/5 text-[#fafafa] rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
                    Import File
                  </button>
                </div>
              </div>
            </DialogHeader>

            <div className="relative group mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4d4d] group-focus-within:text-[#3ecf8e] transition-colors" />
              <input
                type="text"
                placeholder="Search files by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl py-4 pl-11 pr-4 text-sm text-[#fafafa] placeholder:text-[#4d4d4d] focus:outline-none focus:border-[#3ecf8e]/40 transition-all font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5 max-h-[400px] overflow-y-auto custom-scrollbar -mx-2 px-2 pb-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-[#4d4d4d]">
                  <Loader2 className="w-8 h-8 animate-spin text-[#3ecf8e]/60" />
                  <span className="text-[10px] font-bold uppercase tracking-[2.5px]">Syncing Workspace</span>
                </div>
              ) : filteredDocs.length > 0 ? (
                <div className="space-y-1">
                   <h4 className="px-3 text-[9px] font-bold text-[#4d4d4d] uppercase tracking-[2px] mb-3">All Documents</h4>
                   {filteredDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleOpenDoc(doc.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#1c1c1c] rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-[#2e2e2e]"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-[#1c1c1c] border border-[#2e2e2e] flex items-center justify-center group-hover:bg-[#3ecf8e]/5 group-hover:border-[#3ecf8e]/20 transition-all">
                          <FileText className="w-5 h-5 text-[#4d4d4d] group-hover:text-[#3ecf8e]" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-[13px] font-medium text-[#fafafa] truncate group-hover:text-[#3ecf8e] transition-colors tracking-tight">{doc.title || "Untitled Document"}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Clock className="w-3 h-3 text-[#4d4d4d]" />
                            <span className="text-[9px] text-[#4d4d4d] font-bold uppercase tracking-widest">
                              Last edit {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#2e2e2e] group-hover:text-[#fafafa] transition-all" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#1c1c1c] flex items-center justify-center mb-6 border border-[#2e2e2e]">
                    <Search className="w-8 h-8 text-[#4d4d4d]/40" />
                  </div>
                  <h5 className="text-sm font-medium text-[#fafafa] tracking-tight">No results matched your search</h5>
                  <p className="text-xs text-[#4d4d4d] mt-2 font-medium tracking-tight">Try a different name or use the import button above.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1c1c1c]/50 px-8 py-5 border-t border-[#2e2e2e] flex justify-between items-center">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e] animate-pulse" />
               <span className="text-[9px] font-bold text-[#4d4d4d] uppercase tracking-[2px]">{filteredDocs.length} Total Documents</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-[#4d4d4d] hover:text-[#fafafa] transition-all uppercase tracking-[2px] cursor-pointer"
            >
              Close Panel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OpenFileAction;
