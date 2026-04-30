import React, { useState, useEffect } from 'react';
import {
  useHocuspocusAwareness,
  useHocuspocusConnectionStatus,
  useHocuspocusProvider
} from '@hocuspocus/provider-react';
import {
  Share2,
  Globe,
  ChevronRight,
  Menu,
  PanelRight,
  MoreHorizontal,
  Check,
  Download,
  FileText as FileIcon,
  Presentation,
  Cloud,
  CloudOff,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocStore } from '../../../store/doc-store';

import { 
  exportToMarkdown, 
  exportToPDF, 
  exportToDOCX, 
  exportToText 
} from './ExportLogic';
import ShareModal from './ShareModal';

// Custom Export Icons
import WordIcon from '../../../assets/google-docs.png';
import PDFIcon from '../../../assets/pdf.png';
import TXTIcon from '../../../assets/txt.png';
import MDIcon from '../../../assets/markdown.png';

const EditorHeader = ({ onToggleLeft, onToggleRight, isLeftOpen, isRightOpen, editor }) => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const provider = useHocuspocusProvider();

  const status = useHocuspocusConnectionStatus();
  const { isOfflineEnabled, activeDocument } = useDocStore();
  const [syncedTitle, setSyncedTitle] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [showShare, setShowShare] = useState(false);


  useEffect(() => {
    if (!provider) return;
    const yText = provider.document.getText('title');
    const updateTitle = () => setSyncedTitle(yText.toString() || "");
    yText.observe(updateTitle);
    updateTitle();
    return () => yText.unobserve(updateTitle);
  }, [provider]);

  const states = useHocuspocusAwareness();
  const [showUsers, setShowUsers] = useState(false);

  const collaborators = states.filter(s => s.user);
  const displayedUsers = collaborators.slice(0, 3);
  const remainingCount = collaborators.length - 3;

  return (
    <header className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0b10]/60 backdrop-blur-xl sticky top-0 z-[100]">
      {/* Left: Navigation & Toggles */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLeft}
          className={`p-1.5 rounded-md transition-colors ${isLeftOpen ? 'text-[#1D9E75] bg-[#1D9E75]/10' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-[13px] font-medium text-slate-500">
          <span 
            onClick={() => navigate(`/dashboard/workspace/${slug}`)}
            className="hover:text-slate-300 cursor-pointer transition-colors"
          >
            Workspace
          </span>
          <ChevronRight className="w-3 h-3 opacity-30" />
        </div>

        <div className="flex items-center gap-2 text-[13px] font-medium">
          <input
            id="doc-title-input"
            value={syncedTitle}
            onChange={(e) => {
              const val = e.target.value;
              setSyncedTitle(val);
              const yText = provider.document.getText('title');
              yText.delete(0, yText.length);
              yText.insert(0, val);
            }}
            placeholder="Untitled Document"
            className="bg-transparent border-none text-slate-200 truncate max-w-[200px] font-semibold focus:outline-none focus:ring-0 placeholder:text-slate-700"
          />
        </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center ml-2 border-l border-white/10 pl-3">
            {status === 'connected' ? (
              <div className="flex items-center gap-1.5 text-[#1D9E75] bg-[#1D9E75]/10 px-2 py-0.5 rounded-full" title="Saved to cloud">
                <Cloud className="w-3.5 h-3.5" />
              </div>
            ) : status === 'connecting' ? (
              <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full" title="Connecting...">
                <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                <WifiOff className="w-3.5 h-3.5" />
                {isOfflineEnabled && <span className="text-[10px] font-bold uppercase tracking-wider">Saved locally</span>}
              </div>
            )}
          </div>
        </div>

      {/* Right: Presence & Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* User Presence */}
          <div
            className="relative flex items-center mr-2"
            onMouseEnter={() => setShowUsers(true)}
            onMouseLeave={() => setShowUsers(false)}
          >
            <div className="flex -space-x-2 cursor-pointer">
              {displayedUsers.map((collab, i) => (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={collab.clientId || i}
                  className="w-7 h-7 rounded-full border-2 border-[#0a0b10] flex items-center justify-center text-[10px] font-bold text-white shadow-lg overflow-hidden"
                  style={{ backgroundColor: collab.user?.color || '#334155' }}
                >
                  {collab.user?.avatarUrl ? (
                    <img src={collab.user?.avatarUrl} alt="" className="w-full h-full object-cover" />

                  ) : (
                    <span>{collab.user?.name?.charAt(0).toUpperCase() || '?'}</span>
                  )}
                </motion.div>
              ))}
              {remainingCount > 0 && (
                <div className="w-7 h-7 rounded-full border-2 border-[#0a0b10] bg-[#16171d] flex items-center justify-center text-[10px] font-bold text-slate-400">
                  +{remainingCount}
                </div>
              )}
            </div>

            <AnimatePresence>
              {showUsers && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-[#16171d] border border-white/10 rounded-xl shadow-2xl p-2 z-[200] backdrop-blur-2xl"
                >
                  <div className="px-2 py-1.5 border-b border-white/5 mb-1.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Collaborators</p>
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                    {collaborators.map((collab, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-default group">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0 border border-white/5" style={{ backgroundColor: collab.user?.color }}>
                          {collab.user?.avatarUrl ? (
                            <img src={collab.user?.avatarUrl} alt="" className="w-full h-full object-cover" />

                          ) : (
                            <span>{collab.user?.name?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-200 font-medium truncate">{collab.user?.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Export Dropdown - Desktop Only */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setShowExport(!showExport)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${showExport ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            <AnimatePresence>
              {showExport && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-[#16171d] border border-white/10 rounded-xl shadow-2xl p-1.5 z-[200] backdrop-blur-2xl"
                >
                  <button 
                    onClick={() => {
                      exportToDOCX(editor, syncedTitle);
                      setShowExport(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left group cursor-pointer"
                  >
                    <img src={WordIcon} alt="Word" className="w-5 h-5 object-contain" />
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-200 font-bold group-hover:text-white">Microsoft Word</span>
                      <span className="text-[10px] text-slate-500 font-medium">(.docx)</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      exportToPDF(editor, syncedTitle);
                      setShowExport(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left group cursor-pointer"
                  >
                    <img src={PDFIcon} alt="PDF" className="w-5 h-5 object-contain" />
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-200 font-bold group-hover:text-white">PDF document</span>
                      <span className="text-[10px] text-slate-500 font-medium">(.pdf)</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      exportToText(editor, syncedTitle);
                      setShowExport(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left group cursor-pointer"
                  >
                    <img src={TXTIcon} alt="TXT" className="w-5 h-5 object-contain" />
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-200 font-bold group-hover:text-white">Plain text</span>
                      <span className="text-[10px] text-slate-500 font-medium">(.txt)</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      exportToMarkdown(editor, syncedTitle);
                      setShowExport(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left group cursor-pointer"
                  >
                    <img src={MDIcon} alt="MD" className="w-5 h-5 object-contain" />
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-200 font-bold group-hover:text-white">Markdown</span>
                      <span className="text-[10px] text-slate-500 font-medium">(.md)</span>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => {
              setShowShare(true);
              // Auto-switch tab if they clicked Publish specifically (optional)
            }}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button 
            onClick={() => setShowShare(true)}
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeDocument?.visibility === 'public' 
                ? 'bg-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/20' 
                : 'bg-[#1D9E75]/10 text-[#1D9E75] hover:bg-[#1D9E75] hover:text-white shadow-lg shadow-[#1D9E75]/5'
            }`}
          >
            {activeDocument?.visibility === 'public' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Published</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Publish</span>
              </>
            )}
          </button>

          <button
            onClick={onToggleRight}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${isRightOpen ? 'text-[#1D9E75] bg-[#1D9E75]/10' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <PanelRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Share & Publish Modal */}
      <ShareModal 
        isOpen={showShare} 
        onClose={() => setShowShare(false)} 
        docId={activeDocument?.id} 
      />
    </header>
  );
};


export default EditorHeader;
