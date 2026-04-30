import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useHocuspocusProvider } from '@hocuspocus/provider-react';
import { useWorkspaceStore } from '../../../store/workspace-store';
import {
  Search,
  Settings,
  Image as ImageIcon,
  Star,
  Trash2,
  Columns,
  Languages,
  History,
  WifiOff,
  Printer,
  Info,
  Archive,
  FilePlus,
  FileMinus,
  Share2,
  Globe,
  Download,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  exportToMarkdown, 
  exportToPDF, 
  exportToDOCX, 
  exportToText 
} from './ExportLogic';

// Custom Export Icons
import WordIcon from '../../../assets/google-docs.png';
import PDFIcon from '../../../assets/pdf.png';
import TXTIcon from '../../../assets/txt.png';
import MDIcon from '../../../assets/markdown.png';

// Modular Actions
import RenameAction from './sidebar-actions/RenameAction';
import MediaLibraryAction from './sidebar-actions/MediaLibraryAction';
import PageSetupAction from './sidebar-actions/PageSetupAction';
import SidebarItem from './sidebar-actions/SidebarItem';
import OfflineSupportAction from './sidebar-actions/OfflineSupportAction';
import VersionHistoryGroup from './sidebar-actions/VersionHistoryGroup';
import FavoriteAction from './sidebar-actions/FavoriteAction';
import ArchiveAction from './sidebar-actions/ArchiveAction';
import DeleteAction from './sidebar-actions/DeleteAction';
import PresenceSettingsAction from './sidebar-actions/PresenceSettingsAction';



const LeftSidebar = ({ isOpen, onEnterHistoryMode, onPrint, editor }) => {
  const [showMobileExport, setShowMobileExport] = useState(false);
  const { slug } = useParams();
  const provider = useHocuspocusProvider();
  const { workspaces } = useWorkspaceStore();

  const currentWorkspace = workspaces.find(w => w.slug === slug);

  return (
    <aside className="w-[260px] md:w-[280px] border-r border-white/5 bg-[#0a0b10] flex flex-col h-full overflow-hidden shrink-0 shadow-2xl">
      <div className="p-4 flex flex-col h-full w-[260px]">
        {/* Workspace Brand */}
        <div className="flex items-center gap-2.5 px-2 py-2 mb-6">
          <div className="w-7 h-7 bg-gradient-to-br from-[#1D9E75] to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {currentWorkspace?.name?.charAt(0) || 'W'}
          </div>
          <span className="text-xs font-bold text-slate-200 truncate">
            {currentWorkspace?.name || 'My Workspace'}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-hover:text-[#1D9E75] transition-colors" />
          <input
            type="text"
            placeholder="Search commands..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#1D9E75]/50 transition-all"
          />
        </div>

        {/* Mobile-Only Actions */}
        <div className="lg:hidden mb-6 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Document Actions</p>
          <div className="grid grid-cols-2 gap-2 px-1">
            <button className="flex items-center justify-center gap-2 py-2 px-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl text-[11px] font-bold text-slate-300 transition-all">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button className="flex items-center justify-center gap-2 py-2 px-3 bg-[#1D9E75]/10 hover:bg-[#1D9E75] border border-[#1D9E75]/20 rounded-xl text-[11px] font-bold text-[#1D9E75] hover:text-white transition-all">
              <Globe className="w-3.5 h-3.5" />
              Publish
            </button>
          </div>
          
          <div className="px-1">
            <button 
              onClick={() => setShowMobileExport(!showMobileExport)}
              className="w-full flex items-center justify-between py-2 px-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl text-[11px] font-bold text-slate-300 transition-all"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5" />
                Export Options
              </div>
              <ChevronDown className={`w-3 h-3 transition-transform ${showMobileExport ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showMobileExport && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-1 bg-white/[0.02] rounded-xl border border-white/5"
                >
                  <div className="p-1.5 space-y-1">
                    <button 
                      onClick={() => exportToDOCX(editor, "Untitled")}
                      className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left group"
                    >
                      <img src={WordIcon} alt="Word" className="w-4 h-4 object-contain" />
                      <span className="text-[10px] text-slate-300 font-bold">Microsoft Word (.docx)</span>
                    </button>
                    <button 
                      onClick={() => exportToPDF(editor, "Untitled")}
                      className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left group"
                    >
                      <img src={PDFIcon} alt="PDF" className="w-4 h-4 object-contain" />
                      <span className="text-[10px] text-slate-300 font-bold">PDF Document (.pdf)</span>
                    </button>
                    <button 
                      onClick={() => exportToText(editor, "Untitled")}
                      className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left group"
                    >
                      <img src={TXTIcon} alt="TXT" className="w-4 h-4 object-contain" />
                      <span className="text-[10px] text-slate-300 font-bold">Plain Text (.txt)</span>
                    </button>
                    <button 
                      onClick={() => exportToMarkdown(editor, "Untitled")}
                      className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left group"
                    >
                      <img src={MDIcon} alt="MD" className="w-4 h-4 object-contain" />
                      <span className="text-[10px] text-slate-300 font-bold">Markdown (.md)</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Flat List Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-0.5">
          <RenameAction />
          <MediaLibraryAction />
          <PageSetupAction />
          <SidebarItem
            icon={<FilePlus className="w-4 h-4" />}
            label="Add New Page"
            onClick={() => {
              if (provider) {
                const yMap = provider.document.getMap('settings');
                const currentCount = yMap.get('pageCount') || 1;
                yMap.set('pageCount', currentCount + 1);
                toast.success(`Page ${currentCount + 1} added!`);
              }
            }}
          />
          <SidebarItem
            icon={<Languages className="w-4 h-4" />}
            label="Languages"
            onClick={() => toast.info("Languages feature coming soon!", { icon: "🌍" })}
          />
          <OfflineSupportAction />
          <PresenceSettingsAction />
          <VersionHistoryGroup onEnterHistoryMode={onEnterHistoryMode} />

          <SidebarItem icon={<Printer className="w-4 h-4" />} label="Print" onClick={onPrint} />
          <FavoriteAction />
          <ArchiveAction />
        </div>

        {/* Bottom Section - Cleanup */}
        <div className="pt-4 mt-auto border-t border-white/5">
          <DeleteAction />
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
