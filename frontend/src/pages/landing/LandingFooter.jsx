import React from 'react';
import { 
  Layout, 
  ArrowUpRight,
  Globe,
  ShieldCheck,
  Zap
} from 'lucide-react';
import githubIcon from '../../assets/github.png';
import twitterIcon from '../../assets/twitter.png';
import linkedinIcon from '../../assets/linkedin.png';

const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-24 px-6 md:px-10 bg-[#0f0f0f] border-t border-[#242424] overflow-hidden">
      {/* Subtle Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#3ecf8e]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Column */}
          <div className="col-span-2 flex flex-col items-start gap-8">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-[#171717] border border-[#2e2e2e] rounded-xl flex items-center justify-center text-[#3ecf8e] group-hover:scale-110 group-hover:border-[#3ecf8e]/30 transition-all duration-500 shadow-2xl">
                <Layout className="w-5 h-5" />
              </div>
              <span className="text-xl font-medium text-[#fafafa] tracking-tighter">
                Collab<span className="text-[#3ecf8e]">Docs</span>
              </span>
            </div>
            
            <p className="text-[15px] text-[#898989] font-normal leading-relaxed max-w-[280px]">
              The real-time collaborative document editor engineered for teams that demand zero-latency speed.
            </p>

            <div className="flex items-center gap-4">
              {[
                { img: githubIcon, href: 'https://github.com/Ashisharjun12', alt: 'GitHub' },
                { img: twitterIcon, href: 'https://x.com/Ashish37484185', alt: 'Twitter' },
                { img: linkedinIcon, href: 'https://www.linkedin.com/in/ashish-raj-300943188/', alt: 'LinkedIn' }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#171717] border border-[#2e2e2e] flex items-center justify-center hover:border-[#3ecf8e]/40 transition-all duration-300 group"
                >
                  <img 
                    src={social.img} 
                    alt={social.alt} 
                    className="w-4 h-4 invert opacity-50 group-hover:opacity-100 transition-all duration-300" 
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Columns */}
          {[
            {
              title: 'Product',
              links: ['Features', 'Integrations', 'Workflow', 'Pricing', 'Changelog']
            },
            {
              title: 'Company',
              links: ['About Us', 'Careers', 'Blog', 'Contact', 'Press']
            },
            {
              title: 'Resources',
              links: ['Documentation', 'API Reference', 'Status', 'Security', 'Community']
            },
            {
              title: 'Legal',
              links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Licenses', 'DPA']
            }
          ].map((col, i) => (
            <div key={i} className="flex flex-col gap-6">
              <h4 className="text-[11px] font-bold text-[#fafafa] uppercase tracking-[2px]">{col.title}</h4>
              <ul className="flex flex-col gap-4">
                {col.links.map(link => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-[14px] text-[#898989] hover:text-[#fafafa] transition-colors flex items-center gap-1.5 group"
                    >
                      {link}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all duration-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-[#242424] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10">
            <p className="text-[13px] text-[#4d4d4d] font-normal tracking-tight">
              © {currentYear} CollabDocs Inc. All rights reserved.
            </p>
            <div className="h-4 w-px bg-[#242424] hidden md:block" />
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[12px] text-[#4d4d4d] hover:text-[#fafafa] transition-colors cursor-pointer">
                <Globe className="w-3.5 h-3.5" />
                <span>English (US)</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#4d4d4d] hover:text-[#3ecf8e] transition-colors cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-[#3ecf8e]" />
                <span>Systems Operational</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#171717] border border-[#2e2e2e] text-[11px] text-[#898989] font-medium tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3ecf8e]" />
            SOC2 Type II Compliant
          </div>
        </div>

      </div>
    </footer>
  );
};

export default LandingFooter;
