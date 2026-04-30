import React from 'react';
import { Layout } from 'lucide-react';
import githubIcon from '../../assets/github.png';
import linkedinIcon from '../../assets/linkedin.png';
import twitterIcon from '../../assets/twitter.png';

const LandingFooter = () => {
  return (
    <footer className="py-12 px-6 md:px-12 bg-[#0f1117] border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#1D9E75] rounded-lg flex items-center justify-center shadow-lg shadow-[#1D9E75]/10">
              <Layout className="text-white w-4 h-4" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              Collab<span className="text-[#1D9E75]">Docs</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium text-center md:text-left">
            © 2026 CollabDocs Inc. Built by Ashish Raj.
          </p>
        </div>

        <div className="flex items-center gap-10">
          {['privacy', 'terms', 'contact', 'changelog'].map((item) => (
            <a
              key={item}
              href={`/${item}`}
              className="text-[11px] font-bold text-slate-500 hover:text-white transition-all duration-300 uppercase tracking-widest"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <a href="https://github.com/Ashisharjun12" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform cursor-pointer">
            <img src={githubIcon} alt="GitHub" className="w-5 h-5 transition-all duration-300" />
          </a>
          <a href="https://x.com/Ashish37484185" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform cursor-pointer">
            <img src={twitterIcon} alt="Twitter" className="w-5 h-5 transition-all duration-300" />
          </a>
          <a href="https://www.linkedin.com/in/ashish-raj-300943188/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform cursor-pointer">
            <img src={linkedinIcon} alt="LinkedIn" className="w-5 h-5 transition-all duration-300" />
          </a>
        </div>

      </div>
    </footer>
  );
};

export default LandingFooter;

