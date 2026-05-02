import React from 'react';
import { 
  Layout, 
  MessageSquare, 
  Plus, 
  Search, 
  Settings, 
  FileText, 
  Users as UsersIcon, 
  Bell,
  MoreHorizontal,
  Share2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  CheckSquare,
  MessageCircle,
  Hash,
  ChevronDown,
  Monitor,
  MousePointer2
} from 'lucide-react';
import { motion } from 'framer-motion';

const AppPreview = () => {
  return (
    <section className="py-32 px-6 md:px-10 bg-[#171717] border-b border-[#242424] overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 text-center md:text-left">
           <div className="text-[12px] font-medium text-[#3ecf8e] uppercase tracking-[1.5px] mb-4">Deep Dive</div>
           <h2 className="text-3xl md:text-5xl font-medium text-[#fafafa] tracking-tight mb-6 leading-tight">
             Experience the <span className="text-[#3ecf8e]">power</span> of multiplayer <br/> editing at the edge.
           </h2>
        </div>

        <div className="relative group">
          {/* Main Glow */}
          <div className="absolute -inset-20 bg-[#3ecf8e]/5 blur-[120px] rounded-full opacity-50 group-hover:opacity-100 transition duration-1000" />
          
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative bg-[#0f0f0f] rounded-[24px] border border-[#2e2e2e] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col h-[600px] md:h-[800px]"
          >
            {/* Unified Header Bar */}
            <div className="h-14 bg-[#171717] border-b border-[#2e2e2e] flex items-center px-6 justify-between shrink-0">
              <div className="flex items-center gap-6">
                <div className="flex gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="h-4 w-px bg-[#2e2e2e] hidden md:block" />
                <div className="flex items-center gap-2 text-[#898989] text-[13px] font-normal">
                   <span className="opacity-50">Architecture Overview —</span> 
                   <span className="text-[#fafafa] font-medium">CollabDocs</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 mr-4">
                   <div className="w-7 h-7 rounded-full bg-[#3ecf8e] border-2 border-[#171717] flex items-center justify-center text-[10px] font-bold text-[#171717] relative z-20">MK</div>
                   <div className="w-7 h-7 rounded-full bg-purple-500 border-2 border-[#171717] flex items-center justify-center text-[10px] font-bold text-[#fafafa] relative z-10">SR</div>
                </div>
                <button className="px-4 py-1.5 bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#2e2e2e] rounded-full text-[12px] font-medium text-[#fafafa] transition-colors">Updates</button>
                <button className="p-1.5 bg-[#1c1c1c] hover:bg-[#2e2e2e] border border-[#2e2e2e] rounded-full text-[#898989] transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                <button className="px-5 py-1.5 bg-[#3ecf8e] hover:bg-[#00c573] text-[#171717] rounded-full text-[12px] font-bold shadow-[0_0_20px_rgba(62,207,142,0.3)] transition-all">Share</button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Floating Toolbar (Block Style) */}
              <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-[#1c1c1c]/90 backdrop-blur-xl border border-[#2e2e2e] rounded-2xl p-1.5 flex items-center gap-1 shadow-2xl scale-90 md:scale-100">
                <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#2e2e2e] rounded-xl text-[12px] text-[#fafafa] font-medium transition-colors">Text <ChevronDown className="w-3.5 h-3.5 opacity-50" /></button>
                <div className="w-px h-4 bg-[#2e2e2e] mx-1" />
                {[Bold, Italic, Underline, Strikethrough, Link2].map((Icon, i) => (
                  <button key={i} className="p-2 hover:bg-[#2e2e2e] rounded-xl text-[#898989] hover:text-[#fafafa] transition-colors"><Icon className="w-4 h-4" /></button>
                ))}
                <div className="w-px h-4 bg-[#2e2e2e] mx-1" />
                <button className="p-2 hover:bg-[#2e2e2e] rounded-xl text-[#898989]"><MessageCircle className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-red-500/10 text-red-400 rounded-xl"><Plus className="w-4 h-4 rotate-45" /></button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 bg-[#0f0f0f] pt-40 pb-20 px-8 md:px-24 overflow-y-auto custom-scrollbar relative">
                {/* Simulated Multiplayer Cursor */}
                <motion.div 
                  animate={{ x: [0, 100, -50, 0], y: [0, 50, 150, 0] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute z-50 pointer-events-none"
                >
                  <MousePointer2 className="w-5 h-5 text-purple-500 fill-purple-500" />
                  <div className="ml-4 mt-1 bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg">Sarah Rivera</div>
                </motion.div>

                <div className="max-w-3xl mx-auto">
                  <div className="mb-12">
                    <div className="w-16 h-16 bg-[#2e2e2e] rounded-2xl flex items-center justify-center text-3xl mb-8">📐</div>
                    <h1 className="text-5xl md:text-7xl font-medium text-[#fafafa] tracking-tighter mb-4 leading-tight">Architecture Overview</h1>
                    <p className="text-[14px] text-[#4d4d4d] font-medium flex items-center gap-3">
                      Updated just now <span className="opacity-30">•</span> Jordan Lee <span className="opacity-30">•</span> <span className="text-[#3ecf8e]">3 collaborators</span>
                    </p>
                  </div>

                  <div className="space-y-10">
                    <section className="space-y-4">
                       <h3 className="text-3xl font-medium text-[#fafafa] tracking-tight">Introduction</h3>
                       <p className="text-[17px] text-[#898989] leading-[1.6] font-normal">
                         CollabDocs is a <span className="bg-[#3ecf8e]/20 text-[#3ecf8e] px-1 rounded">real-time collaborative</span> document platform for engineering teams. It combines native editor speed with multiplayer sync powered by <span className="bg-[#2e2e2e] text-[#fafafa] px-1 rounded font-mono text-[13px]">CRDT</span> primitives — enabling conflict-free merges across any number of sessions.
                       </p>
                    </section>

                    <section className="space-y-4">
                       <h3 className="text-2xl font-medium text-[#fafafa] tracking-tight">Sync Engine</h3>
                       <p className="text-[17px] text-[#898989] leading-[1.6] font-normal">
                         At the core sits a Rust-based sync daemon managing authoritative document state. All clients connect via WebSocket and receive <span className="bg-[#2e2e2e] text-[#fafafa] px-1 rounded font-mono text-[13px]">op-delta</span> patches rather than full snapshots.
                       </p>
                       <div className="p-6 bg-[#3ecf8e]/5 border border-[#3ecf8e]/10 rounded-2xl flex gap-4 items-start">
                          <span className="text-xl">💡</span>
                          <p className="text-[14px] text-[#898989] leading-relaxed italic">
                            Offline edits are queued locally and rebased atomically on reconnect. Every operation is <span className="bg-[#3ecf8e]/20 text-[#3ecf8e] px-1 rounded not-italic">append-only</span> and replayed via vector clocks.
                          </p>
                       </div>
                    </section>

                    <section className="space-y-4 pt-4">
                       <div className="flex items-center gap-3 group/item">
                          <div className="w-5 h-5 rounded-md border border-[#3ecf8e] bg-[#3ecf8e]/10 flex items-center justify-center">
                             <div className="w-2.5 h-2.5 bg-[#3ecf8e] rounded-sm" />
                          </div>
                          <span className="text-[16px] text-[#4d4d4d] line-through">Define CRDT operation schema</span>
                       </div>
                       <div className="flex items-center gap-3 group/item">
                          <div className="w-5 h-5 rounded-md border border-[#2e2e2e] flex items-center justify-center" />
                          <span className="text-[16px] text-[#898989]">Write integration tests for offline rebase</span>
                       </div>
                    </section>

                    <div className="pt-10 border-t border-[#242424] mt-20 italic text-center">
                       <p className="text-[#4d4d4d] text-lg max-w-lg mx-auto">
                         "The best editor is one you forget you're using — <span className="text-[#fafafa]">CollabDocs</span> gets out of the way."
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Status Bar */}
            <div className="h-10 bg-[#171717] border-t border-[#2e2e2e] flex items-center px-6 justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#3ecf8e]" />
                    <span className="text-[11px] font-medium text-[#3ecf8e] uppercase tracking-wider">Synced</span>
                  </div>
                  <span className="text-[11px] text-[#4d4d4d]">Select any text to see the block menu</span>
               </div>
               <div className="flex items-center gap-4 text-[11px] text-[#4d4d4d]">
                  <span>1,247 words</span>
                  <span className="opacity-30">|</span>
                  <span>v2.4.1</span>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AppPreview;
