import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Trash2, Scissors } from 'lucide-react';
import { useHocuspocusProvider } from '@hocuspocus/provider-react';

const PageBreakComponent = ({ deleteNode }) => {
  const provider = useHocuspocusProvider();

  const handleDelete = () => {
    if (provider) {
      const yMap = provider.document.getMap('settings');
      const currentCount = yMap.get('pageCount') || 1;
      yMap.set('pageCount', Math.max(1, currentCount - 1));
    }
    deleteNode();
  };

  return (
    <NodeViewWrapper className="page-break-container group relative my-10">
      {/* The Gap */}
      <div className="h-[48px] -mx-[96px] bg-[#0a0b10] flex items-center justify-center relative overflow-visible pointer-events-auto">

        {/* The Indicator Line */}
        <div className="absolute inset-x-0 h-px bg-white/5" />

        {/* The Label */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 opacity-40 group-hover:opacity-100 transition-all duration-300">
          <Scissors className="w-3 h-3 text-slate-400" />
          <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">Page Break</span>
        </div>

        {/* The Floating Delete Button - Appears on Hover */}
        <button
          onClick={handleDelete}
          className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-auto opacity-0 group-hover:opacity-100 flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 rounded-lg text-rose-500 hover:text-white transition-all duration-300 shadow-xl"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Delete Page</span>
        </button>
      </div>
    </NodeViewWrapper>
  );
};

export default PageBreakComponent;
