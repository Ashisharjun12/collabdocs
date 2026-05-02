import React, { useMemo } from 'react';
import { Info, FileText, Clock, Calendar, User, Layout, Database, Shield } from 'lucide-react';
import { useDocStore } from '../../../../store/doc-store';
import { useWorkspaceStore } from '../../../../store/workspace-store';
import SidebarItem from './SidebarItem';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const DetailsAction = ({ editor }) => {
  const { activeDocument } = useDocStore();
  const { activeWorkspace } = useWorkspaceStore();

  const stats = useMemo(() => {
    if (!editor || !editor.document) return { words: 0, chars: 0, readTime: 0 };
    let text = "";
    const extractText = (blocks) => {
      blocks.forEach(block => {
        if (block.content) {
          if (Array.isArray(block.content)) text += block.content.map(c => c.text || "").join("") + " ";
          else if (typeof block.content === 'string') text += block.content + " ";
        }
        if (block.children) extractText(block.children);
      });
    };
    extractText(editor.document);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readTime = Math.ceil(words / 200); 
    return { words, chars, readTime };
  }, [editor]);

  if (!activeDocument) return null;

  const owner = activeWorkspace?.members?.find(m => String(m.user?.id || m.userId) === String(activeDocument.ownerId));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div>
          <SidebarItem icon={<Info className="w-4 h-4" />} label="Details" />
        </div>
      </SheetTrigger>
      <SheetContent className="bg-[#171717] border-l border-[#2e2e2e] w-full sm:max-w-[440px] text-[#fafafa] p-0 shadow-2xl">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-8 border-b border-[#2e2e2e] bg-[#1c1c1c]/30">
            <div className="w-12 h-12 rounded-2xl bg-[#3ecf8e]/10 flex items-center justify-center mb-6 border border-[#3ecf8e]/20">
              <Info className="w-6 h-6 text-[#3ecf8e]" />
            </div>
            <SheetTitle className="text-2xl font-bold text-[#fafafa] tracking-tight">Document Details</SheetTitle>
            <SheetDescription className="text-[#4d4d4d] font-medium mt-1">
              Technical metadata and live statistics for this session.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
            {/* Section: Stats */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-[#3ecf8e]">Real-time Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-2xl p-5 shadow-inner">
                  <div className="flex items-center gap-2 text-[#4d4d4d] mb-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Words</span>
                  </div>
                  <div className="text-2xl font-medium text-[#fafafa] tracking-tight">{stats.words}</div>
                </div>
                <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-2xl p-5 shadow-inner">
                  <div className="flex items-center gap-2 text-[#4d4d4d] mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Read Time</span>
                  </div>
                  <div className="text-2xl font-medium text-[#fafafa] tracking-tight">{stats.readTime} min</div>
                </div>
              </div>
              <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-2xl p-5 shadow-inner flex justify-between items-center">
                <div className="flex items-center gap-2 text-[#4d4d4d]">
                  <Database className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Characters</span>
                </div>
                <div className="text-sm font-medium text-[#898989] tabular-nums">{stats.chars.toLocaleString()}</div>
              </div>
            </div>

            {/* Section: Lineage */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-[#4d4d4d]">Lineage & Origin</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1c1c1c] border border-[#2e2e2e] flex items-center justify-center shadow-inner">
                    <User className="w-4 h-4 text-[#4d4d4d]" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-[#4d4d4d] uppercase tracking-widest">Creator</div>
                    <div className="text-sm font-medium text-[#fafafa]">{owner?.user?.name || "System Generated"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1c1c1c] border border-[#2e2e2e] flex items-center justify-center shadow-inner">
                    <Calendar className="w-4 h-4 text-[#4d4d4d]" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-[#4d4d4d] uppercase tracking-widest">Creation Date</div>
                    <div className="text-sm font-medium text-[#fafafa]">{new Date(activeDocument.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1c1c1c] border border-[#2e2e2e] flex items-center justify-center shadow-inner">
                    <Layout className="w-4 h-4 text-[#4d4d4d]" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-[#4d4d4d] uppercase tracking-widest">Home Workspace</div>
                    <div className="text-sm font-medium text-[#fafafa]">{activeWorkspace?.name || "Personal Drive"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: System Fingerprint */}
            <div className="pt-8 border-t border-[#2e2e2e] space-y-4">
              <div className="bg-[#3ecf8e]/5 border border-[#3ecf8e]/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-[#3ecf8e] mb-2">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Fingerprint</span>
                </div>
                <code className="text-[10px] font-mono text-[#898989] break-all leading-relaxed">{activeDocument.id}</code>
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-[#2e2e2e] bg-[#1c1c1c]/20">
             <p className="text-[9px] font-bold text-[#4d4d4d] uppercase tracking-[3px] text-center">Flow Metadata Engine</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DetailsAction;
