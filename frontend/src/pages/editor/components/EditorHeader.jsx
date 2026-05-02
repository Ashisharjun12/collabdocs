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
    <header className="h-14 border-b border-[#2e2e2e] flex items-center justify-between px-6 bg-[#171717] sticky top-0 z-[100] shadow-sm">
      {/* Left: Navigation & Toggles */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleLeft}
          className={`p-2 rounded-lg transition-all cursor-pointer ${isLeftOpen ? 'text-[#3ecf8e] bg-[#3ecf8e]/10 border border-[#3ecf8e]/20' : 'text-[#898989] hover:bg-[#242424] hover:text-[#fafafa] border border-transparent'}`}
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="hidden md:flex items-center gap-3 text-[13px] font-medium text-[#4d4d4d]">
          <span 
            onClick={() => navigate(`/dashboard/workspace/${slug}`)}
            className="hover:text-[#fafafa] cursor-pointer transition-colors tracking-tight"
          >
            Workspace
          </span>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        </div>

        <div className="flex items-center gap-2 text-[14px] font-medium">
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
            className="bg-transparent border-none text-[#fafafa] truncate max-w-[240px] font-medium tracking-tight focus:outline-none focus:ring-0 placeholder:text-[#4d4d4d]"
          />
        </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center ml-2 border-l border-[#2e2e2e] pl-4">
            {status === 'connected' ? (
              <div className="flex items-center gap-1.5 text-[#3ecf8e] bg-[#3ecf8e]/10 px-2.5 py-1 rounded-md border border-[#3ecf8e]/20" title="Saved to cloud">
                <Cloud className="w-3.5 h-3.5" />
              </div>
            ) : status === 'connecting' ? (
              <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20" title="Connecting...">
                <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#898989] bg-[#242424] px-2.5 py-1 rounded-md border border-[#2e2e2e]">
                <WifiOff className="w-3.5 h-3.5" />
                {isOfflineEnabled && <span className="text-[10px] font-bold uppercase tracking-[1.5px]">Local</span>}
              </div>
            )}
          </div>
        </div>

      {/* Right: Presence & Actions */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          {/* User Presence */}
          <div
            className="relative flex items-center mr-2"
            onMouseEnter={() => setShowUsers(true)}
            onMouseLeave={() => setShowUsers(false)}
          >
            <div className="flex -space-x-2.5 cursor-pointer">
              {displayedUsers.map((collab, i) => (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={collab.clientId || i}
                  className="w-8 h-8 rounded-full border-2 border-[#171717] flex items-center justify-center text-[11px] font-bold text-white shadow-xl overflow-hidden ring-1 ring-white/5"
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
                <div className="w-8 h-8 rounded-full border-2 border-[#171717] bg-[#242424] flex items-center justify-center text-[10px] font-bold text-[#898989] ring-1 ring-white/5">
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
                  className="absolute top-full right-0 mt-3 w-60 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl shadow-2xl p-2.5 z-[200]"
                >
                  <div className="px-2 py-2 border-b border-[#2e2e2e] mb-2">
                    <p className="text-[10px] font-medium text-[#4d4d4d] uppercase tracking-[1.5px]">Collaborators</p>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                    {collaborators.map((collab, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 hover:bg-[#242424] rounded-lg transition-all cursor-default group">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0 border border-[#2e2e2e]" style={{ backgroundColor: collab.user?.color }}>
                          {collab.user?.avatarUrl ? (
                            <img src={collab.user?.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{collab.user?.name?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="text-xs text-[#fafafa] font-medium truncate tracking-tight">{collab.user?.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-5 w-px bg-[#2e2e2e] mx-1" />

          {/* Export Dropdown - Desktop Only */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setShowExport(!showExport)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${showExport ? 'bg-[#242424] border-[#3ecf8e]/30 text-[#fafafa]' : 'text-[#898989] hover:text-[#fafafa] hover:bg-[#242424] border-transparent'}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <AnimatePresence>
              {showExport && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute top-full right-0 mt-3 w-60 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl shadow-2xl p-2 z-[200]"
                >
                  {[
                    { icon: WordIcon, name: 'Microsoft Word', ext: '.docx', action: exportToDOCX },
                    { icon: PDFIcon, name: 'PDF Document', ext: '.pdf', action: exportToPDF },
                    { icon: TXTIcon, name: 'Plain Text', ext: '.txt', action: exportToText },
                    { icon: MDIcon, name: 'Markdown', ext: '.md', action: exportToMarkdown },
                  ].map((item) => (
                    <button 
                      key={item.name}
                      onClick={() => {
                        item.action(editor, syncedTitle);
                        setShowExport(false);
                      }}
                      className="w-full flex items-center gap-3.5 p-2.5 hover:bg-[#242424] rounded-lg transition-all text-left group cursor-pointer"
                    >
                      <img src={item.icon} alt="" className="w-5 h-5 object-contain transition-all" />
                      <div className="flex flex-col">
                        <span className="text-xs text-[#fafafa] font-medium group-hover:text-[#3ecf8e] tracking-tight transition-colors">{item.name}</span>
                        <span className="text-[10px] text-[#4d4d4d] font-bold uppercase tracking-wider">{item.ext}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setShowShare(true)}
            className="hidden lg:flex items-center gap-2 px-4 py-2 text-[#898989] hover:text-[#fafafa] hover:bg-[#242424] rounded-lg text-xs font-medium transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="tracking-tight">Share</span>
          </button>
          
          <button 
            onClick={() => setShowShare(true)}
            className={`hidden lg:flex items-center gap-2.5 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              activeDocument?.visibility === 'public' 
                ? 'bg-[#3ecf8e] text-[#171717] border-[#3ecf8e] shadow-lg shadow-[#3ecf8e]/10 hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-[#3ecf8e]/10 text-[#3ecf8e] hover:bg-[#3ecf8e] hover:text-[#171717] border-[#3ecf8e]/20 shadow-inner'
            }`}
          >
            {activeDocument?.visibility === 'public' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="tracking-tight">Published</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5" />
                <span className="tracking-tight">Publish</span>
              </>
            )}
          </button>

          <button
            onClick={onToggleRight}
            className={`p-2 rounded-lg transition-all cursor-pointer ${isRightOpen ? 'text-[#3ecf8e] bg-[#3ecf8e]/10 border border-[#3ecf8e]/20' : 'text-[#898989] hover:bg-[#242424] hover:text-[#fafafa] border border-transparent'}`}
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
