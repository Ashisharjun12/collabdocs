import React from 'react';
import { useNavigate } from 'react-router-dom';
import collabLogo from '../../assets/collabdocs_favicon.svg';

const LandingNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-5 bg-[#0f1117] border-b border-white/[0.05] sticky top-0 z-50 backdrop-blur-xl">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
        <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <img src={collabLogo} alt="CollabDocs Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white leading-none">
          Collab<span className="text-[#1D9E75]">Docs</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-10">
        {['features', 'pricing', 'templates'].map((item) => (
          <a
            key={item}
            href={`#${item}`}
            className="text-[13px] font-semibold text-slate-400 hover:text-white transition-all duration-300 capitalize tracking-wide"
          >
            {item}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-8">
        <button
          onClick={() => navigate('/login')}
          className="text-[13px] font-bold text-slate-400 hover:text-white transition-all duration-300 cursor-pointer"
        >
          Sign in
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="bg-[#1D9E75] hover:bg-[#1D9E75]/90 text-white px-6 py-2.5 rounded-full text-[13px] font-black shadow-xl shadow-[#1D9E75]/10 transition-all active:scale-95 cursor-pointer border border-white/10"
        >
          Get started
        </button>
      </div>
    </nav>
  );
};

export default LandingNavbar;
