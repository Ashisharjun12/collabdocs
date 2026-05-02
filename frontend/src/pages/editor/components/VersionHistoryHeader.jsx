import React from 'react';
import { ArrowLeft, History, RotateCcw, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const VersionHistoryHeader = ({ onExit, onRestore, previewVersion }) => {
  return (
    <header className="h-16 border-b border-[#2e2e2e] flex items-center justify-between px-8 bg-[#0f0f0f] sticky top-0 z-[100] shadow-2xl">
      {/* Left: Exit Navigation */}
      <div className="flex items-center gap-6">
        <button 
          onClick={onExit}
          className="flex items-center gap-2 pr-4 border-r border-[#242424] text-[#898989] hover:text-[#fafafa] transition-colors group cursor-pointer"
          title="Back to live document"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-[13px] font-medium hidden md:block tracking-tight">Exit Preview</span>
        </button>
        
        <div className="flex items-center gap-3">
          <History className="w-4 h-4 text-[#3ecf8e]" />
          <span className="text-[14px] font-medium text-[#fafafa] tracking-tight">Viewing Version</span>
        </div>
      </div>

      {/* Center: Selected Version Info & Restore Button */}
      {previewVersion && (
        <div className="flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-[#4d4d4d]" />
                <span className="text-[14px] font-medium text-[#fafafa] tracking-tight">
                  {previewVersion.name || "Auto-saved version"}
                </span>
             </div>
             <span className="text-[11px] text-[#4d4d4d] font-normal mt-0.5">
               {format(new Date(previewVersion.createdAt), 'MMMM d, yyyy • h:mm a')}
             </span>
          </div>
          
          <div className="h-8 w-px bg-[#242424] hidden md:block" />

          <button 
            onClick={() => onRestore(previewVersion)}
            className="flex items-center gap-2.5 px-6 py-2 bg-[#3ecf8e] text-[#171717] rounded-full text-[13px] font-bold shadow-[0_0_20px_rgba(62,207,142,0.2)] hover:bg-[#00c573] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore This Version
          </button>
        </div>
      )}

      {/* Right: Balance/Status */}
      <div className="hidden lg:flex items-center gap-2 text-[11px] font-bold text-[#4d4d4d] uppercase tracking-[2px]">
         <div className="w-2 h-2 rounded-full bg-[#f5d147] animate-pulse" />
         Read Only Mode
      </div>
    </header>
  );
};

export default VersionHistoryHeader;
