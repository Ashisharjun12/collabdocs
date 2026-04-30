import React, { useMemo } from 'react';
import { Info, FileText, Clock, Calendar, User, Layout, Database } from 'lucide-react';
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

  // Calculate statistics from the editor content
  const stats = useMemo(() => {
    if (!editor) return { words: 0, chars: 0, readTime: 0 };
    
    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readTime = Math.ceil(words / 200); // Average 200 words per minute
    
    return { words, chars, readTime };
  }, [editor?.getText()]);

  if (!activeDocument) return null;

  const owner = activeWorkspace?.members?.find(m => String(m.user?.id || m.userId) === String(activeDocument.ownerId));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div>
          <SidebarItem icon={<Info className="w-4 h-4" />} label="Details" />
        </div>
      </SheetTrigger>
      <SheetContent className="bg-[#0a0b10] border-l border-white/10 w-[400px] sm:w-[540px] text-slate-200 p-0">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-8 border-b border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
            <div className="w-12 h-12 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center mb-4 border border-[#1D9E75]/20">
              <Info className="w-6 h-6 text-[#1D9E75]" />
            </div>
            <SheetTitle className="text-2xl font-bold text-white">Document Details</SheetTitle>
            <SheetDescription className="text-slate-500">
              Technical metadata and statistics for this file.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {/* Section: Stats */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1D9E75]">Real-time Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Words</span>
                  </div>
                  <div className="text-xl font-bold text-white tracking-tight">{stats.words}</div>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Read Time</span>
                  </div>
                  <div className="text-xl font-bold text-white tracking-tight">{stats.readTime} min</div>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Database className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Characters</span>
                </div>
                <div className="text-sm font-medium text-slate-300">{stats.chars.toLocaleString()} total</div>
              </div>
            </div>

            {/* Section: Lineage */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Lineage</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Creator</div>
                    <div className="text-sm font-bold text-slate-200">{owner?.user?.name || "Unknown Creator"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Born On</div>
                    <div className="text-sm font-bold text-slate-200">{new Date(activeDocument.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                    <Layout className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Workspace</div>
                    <div className="text-sm font-bold text-slate-200">{activeWorkspace?.name || "Global Workspace"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: System Info */}
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
                <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Document ID</div>
                <code className="text-[10px] font-mono text-amber-200/60 break-all">{activeDocument.id}</code>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DetailsAction;
