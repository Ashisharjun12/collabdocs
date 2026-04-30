import React from 'react';
import { 
  FileText, 
  MoreVertical, 
  Clock, 
  Trash2, 
  Loader2 
} from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import DocActions from './DocActions';
import { useDocStore } from '../../store/doc-store';

const RecentDocsSection = ({ documents, isLoading, onDelete, onNavigate, activeWorkspaceId, title = "Recent Documents" }) => {
  const { hasMoreDocs, loadMoreDocs, isLoadingMore } = useDocStore();
  return (
    <section>
      {title && (
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-slate-800/40 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</h2>
        </div>
      )}

      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeWorkspaceId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {isLoading && documents.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-[#13151f]/50 border border-[#1e2130] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center gap-4 bg-[#13151f]/40 border border-[#1e2130] p-4 rounded-2xl hover:bg-[#1a1d28] hover:border-[#2a2d3a] transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-black/20"
                >
                  <div 
                    onClick={() => onNavigate(doc.id)}
                    className="flex flex-1 items-center gap-5 min-w-0 cursor-pointer"
                  >
                    <div className="w-11 h-11 bg-[#1D9E75]/10 text-[#1D9E75] rounded-xl flex items-center justify-center border border-[#1D9E75]/10 group-hover:bg-[#1D9E75] group-hover:text-white transition-all shadow-inner">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-bold text-white group-hover:text-[#1D9E75] transition-colors truncate mb-1">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          Last edited {new Date(doc.updatedAt).toLocaleDateString()}
                        </span>
                        {doc.visibility === 'public' && (
                           <span className="flex items-center gap-1.5 text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded-full border border-blue-400/10">
                             Shared with everyone
                           </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <DocActions doc={doc} />
                </div>
              ))}
              
              {hasMoreDocs && (
                <div className="pt-4 pb-2 flex justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => loadMoreDocs(activeWorkspaceId)}
                    disabled={isLoadingMore}
                    className="border-[#1e2130] bg-[#13151f] text-slate-400 hover:text-white hover:bg-[#1a1d28] rounded-xl px-6"
                  >
                    {isLoadingMore ? (
                      <><Loader2 className="w-3 h-3 animate-spin mr-2" /> Loading...</>
                    ) : (
                      'Load older documents'
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#13151f]/30 border-2 border-dashed border-[#1e2130] rounded-3xl py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 bg-[#1a1d28] rounded-full flex items-center justify-center mb-6 border border-[#1e2130] shadow-inner">
                <FileText className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-white text-lg font-bold mb-2">
                {!title ? "No starred documents yet" : "Your workspace is quiet"}
              </h3>
              <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed">
                {!title 
                  ? "Star your most important documents to access them quickly from here." 
                  : "Start by creating a new document to organize your thoughts and collaborate with your team."}
              </p>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default RecentDocsSection;
