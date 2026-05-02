import React from 'react';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import AppPreview from './AppPreview';
import FeaturesSection from './FeaturesSection';
import LandingFooter from './LandingFooter';
import { Mail, ArrowRight, Zap, Shield, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import { Button } from '../../components/ui/button';
import { Integrations } from '../../components/integrations';
import { PricingSection } from '../../components/pricing-section';
import { TestimonialsSection } from '../../components/testimonials-section';
import WorkflowSection from './WorkflowSection';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#171717] text-[#fafafa] selection:bg-[#3ecf8e]/30 selection:text-[#fafafa]">
      <SEO 
        title="CollabDocs | Real-time Collaborative Document Editor"
        description="Experience the future of team collaboration. Write, edit, and brainstorm together in real-time with CollabDocs."
        keywords="real-time editor, collaborative writing, team documents, CollabDocs landing"
        url="/"
      />
      <LandingNavbar />
      
      <main>
        <HeroSection />

        {/* Stats Section - Minimalist */}
        <section className="py-20 px-6 md:px-10 bg-[#171717] border-b border-[#242424]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24">
            <div className="text-center md:text-left">
              <div className="text-4xl font-medium text-[#3ecf8e] mb-2 tracking-tight">2,400+</div>
              <div className="text-[12px] font-medium text-[#4d4d4d] uppercase tracking-[1.2px]">Teams using CollabDocs</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-4xl font-medium text-[#3ecf8e] mb-2 tracking-tight">18ms</div>
              <div className="text-[12px] font-medium text-[#4d4d4d] uppercase tracking-[1.2px]">Average sync latency</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-4xl font-medium text-[#3ecf8e] mb-2 tracking-tight">99.9%</div>
              <div className="text-[12px] font-medium text-[#4d4d4d] uppercase tracking-[1.2px]">Uptime SLA</div>
            </div>
          </div>
        </section>

        <AppPreview />
        <FeaturesSection />

        {/* Integrations Section */}
        <Integrations />

        <WorkflowSection />

        <PricingSection />
        
        <TestimonialsSection />

        {/* Bottom CTA Section - Cinematic */}
        <section className="py-40 px-6 md:px-10 bg-[#171717] relative overflow-hidden text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#3ecf8e]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-medium text-[#fafafa] tracking-tight mb-8 leading-tight">
              Build your next big idea, <span className="text-[#3ecf8e]">together.</span>
            </h2>
            <p className="text-lg text-[#898989] font-normal mb-12 max-w-xl mx-auto leading-relaxed">
              Join the future of collaborative documentation. Free to start, no credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate('/signup')}
                className="bg-[#3ecf8e] hover:bg-[#00c573] text-[#171717] px-10 py-7 rounded-full text-[15px] font-medium shadow-2xl transition-all hover:scale-105 active:scale-95 border-none"
              >
                Get started for free
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate('/contact')}
                className="text-[#fafafa] hover:text-[#fafafa] hover:bg-[#2e2e2e] px-10 py-7 rounded-[6px] text-[15px] font-medium transition-all"
              >
                Talk to an expert
              </Button>
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
