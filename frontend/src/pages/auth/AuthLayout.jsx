import React from 'react';
import { motion } from 'framer-motion';
import { FloatingPaths } from '../../components/floating-paths';
import collabLogo from '../../assets/collabdocs_favicon.svg';
import { useNavigate } from 'react-router-dom';

const AuthLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-[#0a0b10] flex overflow-hidden selection:bg-[#3ecf8e]/30 selection:text-[#fafafa]">
      
      {/* Left Side: Cinematic Branding (Fixed) */}
      <div className="hidden lg:flex relative w-1/2 bg-[#0a0b10] flex-col justify-between p-12 overflow-hidden shrink-0 h-full">
        {/* Background Animation */}
        <div className="absolute inset-0 text-[#3ecf8e]">
          <FloatingPaths position={1} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-transparent to-[#0a0b10]/40" />

        {/* Logo Area */}
        <div 
          className="relative z-10 flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-[#171717] border border-[#2e2e2e] rounded-xl flex items-center justify-center group-hover:border-[#3ecf8e]/40 transition-all duration-500">
            <img src={collabLogo} alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          <span className="text-xl font-medium tracking-tight text-[#fafafa]">
            Collab<span className="text-[#3ecf8e]">Docs</span>
          </span>
        </div>

        {/* Branding Footer */}
        <div className="relative z-10">
           <p className="text-[#4d4d4d] text-sm font-medium tracking-tight leading-relaxed max-w-[280px]">
             CollabDocs is a combination of <span className="text-[#fafafa]">Google Docs</span> + <span className="text-[#fafafa]">Notion</span> editor.
           </p>
        </div>
      </div>

      {/* Right Side: Auth Form Container (Scrollable) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0a0b10] lg:bg-[#111218] relative overflow-y-auto custom-scrollbar h-full">
        <div className="absolute top-0 right-0 w-full h-full lg:hidden opacity-20 text-[#3ecf8e]">
          <FloatingPaths position={0.5} />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px] relative z-10"
        >
          {children}
        </motion.div>
      </div>

    </div>
  );
};

export default AuthLayout;
