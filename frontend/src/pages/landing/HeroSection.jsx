import React from 'react';
import { Play, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-20 pb-16 px-6 md:px-10 text-center border-b border-[#1e2130] overflow-hidden bg-[#0f1117]">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#1D9E75]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D9E75]/10 border border-[#1D9E75]/20 text-[#1D9E75] text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Sparkles className="w-3.5 h-3.5" />
          Real-time collaboration — now live
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mb-8">
          Documents your whole team can <span className="text-[#1D9E75]">write, edit, and think in</span> — together
        </h1>

        <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mb-12 leading-relaxed">
          CollabDocs is a modern collaborative document editor. Create workspaces, invite your team, and edit in real-time — with comments, version history, and powerful sharing built in.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
          <button
            onClick={() => navigate('/signup')}
            className="bg-[#1D9E75] hover:bg-[#1D9E75]/90 text-white px-10 py-4 rounded-full text-sm font-black shadow-2xl shadow-[#1D9E75]/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer border border-white/10"
          >
            Start for free
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 px-10 py-4 rounded-full text-sm font-bold transition-all flex items-center gap-3 group cursor-pointer">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Play className="w-3 h-3 fill-white" />
            </div>
            Watch demo
          </button>
        </div>


        {/* Social Proof */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex -space-x-3">
            {[
              { name: 'AK', color: 'bg-[#1D9E75]' },
              { name: 'RS', color: 'bg-[#534AB7]' },
              { name: 'SP', color: 'bg-[#D85A30]' },
              { name: 'MK', color: 'bg-[#185FA5]' },
              { name: 'JV', color: 'bg-[#854F0B]' },
            ].map((user, i) => (
              <div
                key={i}
                className={`${user.color} w-10 h-10 rounded-full border-2 border-[#0f1117] flex items-center justify-center text-[11px] font-black text-white shadow-xl`}
              >
                {user.name}
              </div>
            ))}
            <div className="bg-slate-800 w-10 h-10 rounded-full border-2 border-[#0f1117] flex items-center justify-center text-[11px] font-black text-slate-400 shadow-xl">
              +
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Joined by <span className="text-white font-bold">2,400+</span> teams already
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
