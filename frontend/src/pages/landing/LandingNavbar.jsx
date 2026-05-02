import React from 'react';
import { useNavigate } from 'react-router-dom';
import collabLogo from '../../assets/collabdocs_favicon.svg';
import { Button } from '../../components/ui/button';

const LandingNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-[#171717]/80 border-b border-[#242424] sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
        <div className="w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <img src={collabLogo} alt="CollabDocs Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-xl font-medium tracking-tight text-[#fafafa] leading-none">
          Collab<span className="text-[#3ecf8e]">Docs</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {['Features', 'Pricing', 'Templates'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-[14px] font-medium text-[#898989] hover:text-[#fafafa] transition-colors duration-200 cursor-pointer"
          >
            {item}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/login')}
          className="text-[14px] font-medium text-[#898989] hover:text-[#fafafa] hover:bg-transparent px-4 cursor-pointer"
        >
          Sign in
        </Button>
        <Button
          onClick={() => navigate('/signup')}
          className="bg-[#3ecf8e] hover:bg-[#00c573] text-[#171717] px-5 py-2 rounded-full text-[14px] font-medium shadow-sm transition-all active:scale-95 border-none cursor-pointer"
        >
          Start your project
        </Button>
      </div>
    </nav>
  );
};

export default LandingNavbar;
