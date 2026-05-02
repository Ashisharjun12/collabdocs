import React from 'react';
import { Play, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-24 px-6 md:px-10 text-center overflow-hidden bg-[#171717]">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#3ecf8e]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 text-[#3ecf8e] text-[12px] font-medium tracking-wide mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Sparkles className="w-3.5 h-3.5" />
          Real-time collaboration — now live
        </div>

        <h1 className="text-5xl md:text-[72px] font-medium text-[#fafafa] tracking-[-0.04em] leading-[1.00] max-w-4xl mb-8">
          The <span className="text-[#3ecf8e]">real-time collaborative editor</span> built for teams
        </h1>

        <p className="text-[18px] md:text-[20px] text-[#898989] font-normal max-w-2xl mb-12 leading-[1.56]">
          Experience the future of team collaboration. Write, edit, and brainstorm together in real-time with CollabDocs.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Button
            onClick={() => navigate('/signup')}
            className="bg-[#0f0f0f] hover:bg-[#1a1a1a] text-[#fafafa] px-8 py-6 rounded-full text-[14px] font-medium transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 border border-[#fafafa] cursor-pointer"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline"
            className="bg-transparent hover:bg-[#2e2e2e] text-[#fafafa] border-[#2e2e2e] px-8 py-6 rounded-[6px] text-[14px] font-medium transition-all flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-5 h-5 bg-[#3e3e3e] rounded-full flex items-center justify-center group-hover:bg-[#4d4d4d] transition-colors">
              <Play className="w-2.5 h-2.5 fill-[#fafafa] text-[#fafafa]" />
            </div>
            Watch demo
          </Button>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
