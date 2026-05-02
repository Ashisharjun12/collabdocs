import React, { useState, useEffect } from 'react';
import { Loader2, Clock, ChevronRight, History, Pencil, Sparkles } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { docApi } from '../../../services/api';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const VersionHistorySidebar = ({ previewVersion, setPreviewVersion }) => {
  const { docId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [versions, setVersions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [editingVersionId, setEditingVersionId] = useState(null);
  const [editName, setEditName] = useState("");

  const startEditing = (e, v) => {
    e.stopPropagation();
    setEditingVersionId(v.id);
    setEditName(v.name || "Auto-saved version");
  };

  const handleRename = async (v) => {
    try {
      if (editName.trim() === "" || editName === (v.name || "Auto-saved version")) {
        setEditingVersionId(null);
        return;
      }
      await docApi.renameVersion(docId, v.id, editName);
      setVersions(prev => prev.map(ver => ver.id === v.id ? { ...ver, name: editName } : ver));
    } catch (error) {
      console.error("Failed to rename version:", error);
    } finally {
      setEditingVersionId(null);
    }
  };

  const handleKeyDown = (e, v) => {
    if (e.key === 'Enter') handleRename(v);
    if (e.key === 'Escape') setEditingVersionId(null);
  };

  const fetchVersions = async (currentPage = 1, append = false) => {
    try {
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);

      const res = await docApi.getVersions(docId, currentPage, 20);
      const newVersions = res.data.data.versions;
      
      setVersions(prev => {
        return append ? [...prev, ...newVersions] : newVersions;
      });
      
      setHasMore(res.data.data.hasMore);
      setPage(currentPage);

      if (!append && newVersions.length > 0 && !previewVersion) {
        setPreviewVersion(newVersions[0]);
      }
    } catch (error) {
      console.error("Failed to fetch versions:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchVersions(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchVersions(page + 1, true);
    }
  };

  return (
    <aside className="w-[320px] border-l border-[#2e2e2e] bg-[#171717] flex flex-col h-full shrink-0 z-30 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
      <div className="p-6 border-b border-[#242424] bg-[#0f0f0f]/40">
        <h2 className="text-[12px] font-bold text-[#fafafa] uppercase tracking-[2px] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 flex items-center justify-center">
             <History className="w-4 h-4 text-[#3ecf8e]" />
          </div>
          Timeline
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        {isLoading && versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 gap-4">
            <Loader2 className="w-8 h-8 text-[#3ecf8e] animate-spin" />
            <span className="text-[11px] font-bold text-[#4d4d4d] uppercase tracking-widest">Scanning History...</span>
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 gap-4 text-center px-6">
            <Clock className="w-10 h-10 text-[#2e2e2e] mb-2" />
            <span className="text-[14px] font-medium text-[#fafafa]">Clean History</span>
            <span className="text-[11px] text-[#4d4d4d] leading-relaxed">Versions are auto-saved as you collaborate in real-time.</span>
          </div>
        ) : (
          <div className="space-y-1">
            {versions.map((v, i) => {
              const isAutoSave = !v.name;
              const title = v.name || "Auto-saved version";
              const date = new Date(v.createdAt);
              const isSelected = previewVersion?.id === v.id;
              
              return (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={v.id}
                  onClick={() => setPreviewVersion(v)}
                  className={`group relative flex flex-col p-4 rounded-2xl transition-all cursor-pointer border ${
                    isSelected 
                      ? 'bg-[#3ecf8e]/5 border-[#3ecf8e]/30 shadow-[0_0_20px_rgba(62,207,142,0.05)]' 
                      : 'border-transparent hover:bg-[#1c1c1c] hover:border-[#2e2e2e]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#3ecf8e] rounded-r-full shadow-[0_0_10px_#3ecf8e]" />
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1 flex-1 min-w-0 pl-1">
                      {editingVersionId === v.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, v)}
                          onBlur={() => handleRename(v)}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          className="bg-transparent border-b border-[#3ecf8e] outline-none text-[13px] font-medium text-[#fafafa] py-0.5"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                           {!isAutoSave && <Sparkles className="w-3 h-3 text-[#3ecf8e] shrink-0" />}
                           <span className={`text-[13px] font-medium truncate tracking-tight transition-colors ${
                             isSelected ? 'text-[#3ecf8e]' : 'text-[#efefef]'
                           }`}>
                             {title}
                           </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-1">
                         <span className={`text-[11px] font-medium ${isSelected ? 'text-[#3ecf8e]/60' : 'text-[#4d4d4d]'}`}>
                           {format(date, 'MMM d, h:mm a')}
                         </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                      {editingVersionId !== v.id && (
                        <button 
                          onClick={(e) => startEditing(e, v)}
                          className="p-1.5 text-[#4d4d4d] hover:text-[#fafafa] rounded-lg hover:bg-[#2e2e2e] transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSelected ? 'text-[#3ecf8e] translate-x-0.5' : 'text-[#4d4d4d]'}`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {hasMore && (
          <div className="pt-6 pb-2 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-2.5 rounded-full border border-[#2e2e2e] text-[11px] font-bold text-[#898989] hover:text-[#fafafa] hover:bg-[#1c1c1c] hover:border-[#3ecf8e]/30 transition-all disabled:opacity-50 active:scale-95 uppercase tracking-widest"
            >
              {isLoadingMore ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
              ) : (
                "Load Older Versions"
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default VersionHistorySidebar;
