import React from 'react';
import { Layout, MessageSquare, Plus, Search, Settings } from 'lucide-react';

const AppPreview = () => {
  return (
    <section className="py-20 px-6 md:px-10 bg-[#0f1117] border-b border-[#1e2130]">
      <div className="max-w-6xl mx-auto">
        <div className="relative group">
          {/* Decorative Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#1D9E75]/20 to-[#534AB7]/20 rounded-[2.5rem] blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          
          <div className="relative bg-[#13151f] rounded-[2rem] border border-[#1e2130] overflow-hidden shadow-2xl flex flex-col h-[500px] md:h-[600px]">
            {/* Window Controls */}
            <div className="h-12 bg-[#0f1117]/50 border-b border-[#1e2130] flex items-center px-6 gap-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 max-w-md bg-[#13151f] border border-[#1e2130] rounded-lg px-4 py-1 text-[11px] text-slate-500 font-medium">
                thecollabdocs.tech/workspace/cs-team/backend-arch
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Mini Sidebar */}
              <div className="w-64 bg-[#0f1117]/50 border-r border-[#1e2130] p-6 hidden md:flex flex-col gap-8">
                <div className="bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#1D9E75] rounded-lg flex items-center justify-center shadow-lg shadow-[#1D9E75]/20">
                    <Layout className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">CS Team</div>
                    <div className="text-[10px] text-[#1D9E75] font-bold">Workspace</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-3 mb-4">Pages</div>
                  <div className="bg-[#1D9E75]/10 text-[#1D9E75] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
                    Backend architecture
                  </div>
                  {['Project roadmap', 'Meeting notes', 'API spec v2'].map((page) => (
                    <div key={page} className="text-slate-500 hover:text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors">
                      {page}
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-[#1e2130] space-y-4">
                   <div className="flex items-center gap-3 text-slate-500 px-3">
                     <Search className="w-4 h-4" />
                     <span className="text-xs font-bold">Search</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-500 px-3">
                     <Settings className="w-4 h-4" />
                     <span className="text-xs font-bold">Settings</span>
                   </div>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 bg-[#13151f] p-8 md:p-12 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Backend architecture</h2>
                  
                  <div className="space-y-4">
                    <div className="h-2 w-3/4 bg-[#1D9E75]/40 rounded-full" />
                    <div className="h-2 w-full bg-slate-800 rounded-full" />
                    <div className="h-2 w-[90%] bg-slate-800 rounded-full" />
                    <div className="h-2 w-[85%] bg-slate-800 rounded-full" />
                    <div className="h-2 w-1/2 bg-[#534AB7]/40 rounded-full mt-8" />
                    <div className="h-2 w-full bg-slate-800 rounded-full" />
                    <div className="h-2 w-[80%] bg-slate-800 rounded-full" />
                  </div>

                  {/* Collaborative Comment */}
                  <div className="mt-12 flex gap-4 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                    <div className="w-8 h-8 rounded-full bg-[#534AB7] flex items-center justify-center text-[10px] font-black text-white ring-2 ring-[#534AB7]/20 flex-shrink-0">
                      RS
                    </div>
                    <div className="bg-[#534AB7]/10 border border-[#534AB7]/20 rounded-2xl rounded-tl-none p-4 max-w-sm">
                      <div className="text-xs font-black text-[#877ef2] mb-1">Rahul Sharma</div>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Should we consider Redis Cluster for the queue layer to handle the predicted 10x traffic spike next month?
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Presence Sidebar */}
              <div className="w-48 bg-[#0f1117]/50 border-l border-[#1e2130] p-6 hidden lg:flex flex-col gap-6">
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Online · 3</div>
                <div className="space-y-4">
                  {[
                    { name: 'Ashish', initials: 'AK', color: 'bg-[#1D9E75]' },
                    { name: 'Rahul', initials: 'RS', color: 'bg-[#534AB7]' },
                    { name: 'Sneha', initials: 'SP', color: 'bg-[#D85A30]' },
                  ].map((user) => (
                    <div key={user.name} className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`${user.color} w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black text-white ring-2 ring-white/5`}>
                          {user.initials}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#13151f]" />
                      </div>
                      <span className="text-xs font-bold text-slate-400">{user.name}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-[#1e2130]">
                  <div className="text-[10px] text-slate-600 font-bold mb-1">Last Saved</div>
                  <div className="text-[11px] text-[#1D9E75] font-black">Just now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPreview;
