import React from 'react';
import { ArrowLeft, History, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

const VersionHistoryHeader = ({ onExit, onRestore, previewVersion }) => {
  return (
    <header className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0b10] sticky top-0 z-[100]">
      {/* Left: Exit Navigation */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onExit}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Back to live document"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#1D9E75]" />
          <span className="text-[14px] font-bold text-slate-200">Version history</span>
        </div>
      </div>

      {/* Center: Selected Version Info & Restore Button */}
      {previewVersion && (
        <div className="flex items-center gap-4 absolute left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center">
             <span className="text-[12px] font-bold text-slate-200">
               {previewVersion.name || "Auto-saved version"}
             </span>
             <span className="text-[10px] text-slate-500 font-medium">
               {format(new Date(previewVersion.createdAt), 'MMM d, yyyy h:mm a')}
             </span>
          </div>
          <button 
            onClick={() => onRestore(previewVersion)}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#1D9E75] text-white rounded-full text-[12px] font-bold shadow-md shadow-[#1D9E75]/20 hover:opacity-90 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore this version
          </button>
        </div>
      )}

      {/* Right: Empty for balance */}
      <div className="w-10"></div>
    </header>
  );
};

export default VersionHistoryHeader;
