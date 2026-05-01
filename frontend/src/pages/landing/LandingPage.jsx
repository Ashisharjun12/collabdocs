import React from 'react';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import AppPreview from './AppPreview';
import FeaturesSection from './FeaturesSection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import LandingFooter from './LandingFooter';
import { Mail, ArrowRight, Zap, Shield, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 selection:bg-[#1D9E75]/30 selection:text-white">
      <SEO 
        title="CollabDocs | Real-time Collaborative Document Editor"
        description="Experience the future of team collaboration. Write, edit, and brainstorm together in real-time with CollabDocs."
        keywords="real-time editor, collaborative writing, team documents, CollabDocs landing"
        url="/"
      />
      <LandingNavbar />
      
      <main>
        <HeroSection />

        {/* Stats Section */}
        <section className="py-12 px-6 md:px-10 bg-[#0f1117] border-b border-[#1e2130]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#13151f] p-8 rounded-[2rem] border border-[#1e2130] text-center group hover:border-[#1D9E75]/30 transition-all">
              <div className="text-3xl font-black text-[#1D9E75] mb-2 tracking-tight group-hover:scale-110 transition-transform">2,400+</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Teams using CollabDocs</div>
            </div>
            <div className="bg-[#13151f] p-8 rounded-[2rem] border border-[#1e2130] text-center group hover:border-[#1D9E75]/30 transition-all">
              <div className="text-3xl font-black text-[#1D9E75] mb-2 tracking-tight group-hover:scale-110 transition-transform">18ms</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Average sync latency</div>
            </div>
            <div className="bg-[#13151f] p-8 rounded-[2rem] border border-[#1e2130] text-center group hover:border-[#1D9E75]/30 transition-all">
              <div className="text-3xl font-black text-[#1D9E75] mb-2 tracking-tight group-hover:scale-110 transition-transform">99.9%</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Uptime SLA</div>
            </div>
          </div>
        </section>

        <AppPreview />
        <FeaturesSection />

        {/* How It Works Section */}
        <section className="py-24 px-6 md:px-10 bg-[#0f1117] border-b border-[#1e2130]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <h4 className="text-[10px] font-black text-[#1D9E75] uppercase tracking-[0.2em] mb-4">Workflow</h4>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4 max-w-xl">
                Up and running in under 2 minutes
              </h2>
            </div>

            <div className="space-y-12">
              {[
                { 
                  num: '1', 
                  title: 'Create a Workspace', 
                  desc: 'Sign up with Google or email. Name your workspace, pick an icon, and set it to private or team-wide access.' 
                },
                { 
                  num: '2', 
                  title: 'Invite Your Team', 
                  desc: 'Send invite links by email or share a workspace link. Assign roles — editor, admin, or viewer — in one click.' 
                },
                { 
                  num: '3', 
                  title: 'Write Together, Live', 
                  desc: 'Create documents, edit in real-time, comment, and never lose a version. Everything syncs instantly across devices.' 
                }
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-8 group">
                  <div className="w-12 h-12 rounded-2xl bg-[#1D9E75]/10 border border-[#1D9E75]/20 flex items-center justify-center text-[#1D9E75] font-black text-lg flex-shrink-0 group-hover:bg-[#1D9E75] group-hover:text-white transition-all duration-300">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-2 tracking-tight">{step.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-xl">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PricingSection />
        <TestimonialsSection />

        {/* Bottom CTA Section */}
        <section className="py-32 px-6 md:px-10 bg-[#0f1117] relative overflow-hidden text-center border-t border-white/[0.05]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#1D9E75]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8">
              Ready to collaborate?
            </h2>
            <p className="text-lg text-slate-500 font-medium mb-12 leading-relaxed">
              Join 2,400+ teams already using CollabDocs. Free to start, no credit card needed.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <button
                onClick={() => navigate('/signup')}
                className="bg-white text-[#0f1117] hover:bg-slate-200 px-8 py-4 rounded-full text-sm font-black shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="bg-[#1D9E75] hover:bg-[#1D9E75]/90 text-white px-8 py-4 rounded-full text-sm font-black shadow-xl shadow-[#1D9E75]/10 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
