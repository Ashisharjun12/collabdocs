import React, { useState, useEffect } from 'react';
import { Loader2, Clock, ChevronRight, History, Pencil } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { docApi } from '../../../services/api';
import { useParams } from 'react-router-dom';

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

      // Auto-select the first version if none is selected
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
    <aside className="w-[300px] border-l border-white/5 bg-[#0a0b10] flex flex-col h-full shrink-0 z-30 shadow-2xl">
      <div className="p-4 border-b border-white/5 bg-[#16171d]">
        <h2 className="text-[13px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          Version History
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
        {isLoading && versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Loader2 className="w-6 h-6 text-[#1D9E75] animate-spin" />
            <span className="text-[12px] font-medium text-slate-500">Loading history...</span>
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-center px-4">
            <Clock className="w-8 h-8 text-slate-600 mb-2" />
            <span className="text-[13px] font-bold text-slate-300">No versions yet</span>
            <span className="text-[11px] text-slate-500">Versions are auto-saved in the background while you type.</span>
          </div>
        ) : (
          versions.map((v) => {
            const isAutoSave = !v.name;
            const title = v.name || "Auto-saved version";
            const date = new Date(v.createdAt);
            const isSelected = previewVersion?.id === v.id;
            
            return (
              <div
                key={v.id}
                onClick={() => setPreviewVersion(v)}
                className={`group flex flex-col p-3 rounded-xl transition-all cursor-pointer border ${
                  isSelected 
                    ? 'bg-[#1D9E75]/10 border-[#1D9E75]/30' 
                    : 'border-transparent hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isAutoSave ? (
                      <div className={`shrink-0 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#1D9E75]' : 'bg-slate-500'}`} />
                    ) : (
                      <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#1D9E75] shadow-sm shadow-[#1D9E75]/50" />
                    )}
                    {editingVersionId === v.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, v)}
                        onBlur={() => handleRename(v)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-transparent border-b border-[#1D9E75] outline-none text-[13px] font-bold text-slate-100 placeholder:text-slate-600"
                      />
                    ) : (
                      <span className={`text-[13px] font-bold truncate ${
                        isSelected ? 'text-[#1D9E75]' : isAutoSave ? 'text-slate-400' : 'text-slate-200'
                      }`}>
                        {title}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingVersionId !== v.id && (
                      <button 
                        onClick={(e) => startEditing(e, v)}
                        className="p-1 text-slate-500 hover:text-white rounded-md hover:bg-white/10"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#1D9E75] opacity-100' : 'text-slate-500'}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1 pl-3.5">
                  <span className={`text-[11px] font-medium ${isSelected ? 'text-[#1D9E75]/70' : 'text-slate-500'}`}>
                    {format(date, 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </div>
            );
          })
        )}
        
        {/* Pagination Load More */}
        {hasMore && (
          <div className="pt-2 pb-1 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-slate-500 hover:text-[#1D9E75] hover:bg-[#1D9E75]/10 transition-all disabled:opacity-50"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading...
                </>
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
