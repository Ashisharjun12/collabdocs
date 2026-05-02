import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FilePlus, 
  Languages, 
  Maximize, 
  History, 
  Printer, 
  Presentation,
  BookmarkPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspaceStore } from '../../../store/workspace-store';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Modular Actions
import RenameAction from './sidebar-actions/RenameAction';
import MediaLibraryAction from './sidebar-actions/MediaLibraryAction';
import PageSetupAction from './sidebar-actions/PageSetupAction';
import SidebarItem from './sidebar-actions/SidebarItem';
import OfflineSupportAction from './sidebar-actions/OfflineSupportAction';
import FavoriteAction from './sidebar-actions/FavoriteAction';
import ArchiveAction from './sidebar-actions/ArchiveAction';
import DeleteAction from './sidebar-actions/DeleteAction';
import NameVersionAction from './sidebar-actions/NameVersionAction';
import { useLayoutStore } from '../../../store/layout-store';

const LeftSidebar = ({ isOpen, onEnterHistoryMode, onPrint, provider, editor }) => {
  const { slug } = useParams();
  const { workspaces } = useWorkspaceStore();
  const { isZenMode, setZenMode, setLeftOpen, setRightOpen } = useLayoutStore();
  const activeWorkspace = workspaces.find(w => w.slug === slug);

  const toggleFocusMode = () => {
    const nextZen = !isZenMode;
    setZenMode(nextZen);
    if (nextZen) {
      toast.success("Focus Mode enabled!", { 
        description: "Sidebars hidden. Press Esc to exit.",
        icon: <div className="w-2 h-2 rounded-full bg-amber-400" /> 
      });
      // Optionally hide sidebars automatically
      setLeftOpen(false);
      setRightOpen(false);
    } else {
      toast("Focus Mode disabled");
      setLeftOpen(true);
    }
  };

  return (
    <aside className="w-[280px] border-r border-[#2e2e2e] bg-[#171717] flex flex-col h-full overflow-hidden shrink-0 shadow-2xl relative z-20">
      {/* Header - Minimalist Workspace Brand */}
      <div className="p-6 border-b border-[#2e2e2e]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#3ecf8e] flex items-center justify-center text-[#171717] shadow-lg shadow-[#3ecf8e]/10">
            <Presentation className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[10px] font-bold text-[#4d4d4d] uppercase tracking-[2px] mb-0.5">Workspace</h2>
            <p className="text-sm font-medium text-[#fafafa] truncate tracking-tight">{activeWorkspace?.name || 'Loading...'}</p>
          </div>
        </div>
      </div>

      {/* Simple Menu Items */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        
        {/* Document Actions Section */}
        <div className="space-y-1.5">
          <h3 className="px-2 text-[10px] font-bold text-[#4d4d4d] uppercase tracking-[2px] mb-4">Document Menu</h3>
          
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
            label="Language"
            onClick={() => toast.info("Languages feature coming soon!", { icon: "🌍" })}
          />
        </div>

        {/* Separator */}
        <div className="h-px bg-[#2e2e2e] mx-2" />

        {/* Collaboration & View Section */}
        <div className="space-y-1.5">
          <OfflineSupportAction />
          
          <SidebarItem
            icon={<Maximize className="w-4 h-4" />}
            label="Focus Mode"
            onClick={toggleFocusMode}
            rightIcon={isZenMode && <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse" />}
          />
          
          <Accordion type="single" collapsible className="border-none w-full shadow-none space-y-1">
            <AccordionItem value="versions" className="border-none">
              <AccordionTrigger className="p-0 border-none hover:no-underline [&>svg]:hidden">
                <SidebarItem 
                  icon={<History className="w-4 h-4" />} 
                  label="Versions" 
                />
              </AccordionTrigger>
              <AccordionContent className="p-0 mt-1.5 space-y-1 ml-4 border-l border-[#2e2e2e]">
                <SidebarItem 
                  icon={<History className="w-4 h-4" />} 
                  label="View History" 
                  isSubItem={false}
                  onClick={onEnterHistoryMode} 
                />
                <NameVersionAction />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Separator */}
        <div className="h-px bg-[#2e2e2e] mx-2" />

        {/* Utility Section */}
        <div className="space-y-1.5">
          <SidebarItem 
            icon={<Printer className="w-4 h-4" />} 
            label="Print Document" 
            onClick={onPrint} 
          />
          
          <FavoriteAction />
          <ArchiveAction />
          <DeleteAction />
        </div>
      </div>

      {/* Footer - Minimalist */}
      <div className="p-6 border-t border-[#2e2e2e] bg-[#1c1c1c]/30">
         <p className="text-[9px] font-bold text-[#4d4d4d] uppercase tracking-[2px] text-center">
           Document Controls
         </p>
      </div>
    </aside>
  );
};

export default LeftSidebar;
