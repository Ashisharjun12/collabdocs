import React from 'react';
import { Outlet } from 'react-router-dom';

const EditorLayout = () => {
  return (
    <div className="h-screen w-full bg-[#0a0b10] overflow-hidden">
      {/* 
         This layout is now just a pass-through container. 
         All the Notion-style UI (Sidebars, Header) is managed 
         directly in EditorPage for better state control.
      */}
      <Outlet />
    </div>
  );
};

export default EditorLayout;
