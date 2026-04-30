import React from 'react';
import { Plus, FileText } from 'lucide-react';

const CreateDocSection = ({ onOpenModal }) => {
  return (
    <section className="mb-12">
      <h2 className="text-[13px] font-bold text-slate-400 mb-6 tracking-wide">Start a new document</h2>
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col gap-3">
          <button 
            onClick={onOpenModal}
            className="w-full sm:w-64 h-32 bg-[#13151f] border border-[#1e2130] rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-[#1D9E75] transition-all group relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#1D9E75]/5 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#1D9E75]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 bg-[#0F6E56]/10 rounded-xl flex items-center justify-center text-[#1D9E75] group-hover:scale-110 transition-transform shadow-inner border border-[#1D9E75]/10">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-[13px] font-bold text-white">Blank document</span>
          </button>
        </div>
        
        {/* Template Placeholders */}
        <div className="hidden sm:flex flex-col gap-3">
          <div 
            onClick={() => {
              import('sonner').then(({ toast }) => toast.info('Templates coming soon!'));
            }}
            className="w-64 h-32 bg-[#13151f] border border-[#1e2130] rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-500/30 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-blue-500/5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/10 group-hover:scale-110 transition-transform shadow-inner">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-[13px] font-bold text-slate-400 group-hover:text-white transition-colors">Meeting notes Template</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateDocSection;
