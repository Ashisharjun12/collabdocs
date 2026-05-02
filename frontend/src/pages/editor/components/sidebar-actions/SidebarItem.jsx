import React from 'react';

const SidebarItem = ({ icon, label, active, onClick, isSubItem, rightIcon }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all group border border-transparent ${
    active 
      ? 'bg-[#3ecf8e]/10 text-[#3ecf8e] border-[#3ecf8e]/20' 
      : 'text-[#898989] hover:bg-[#1c1c1c] hover:text-[#fafafa] hover:border-[#2e2e2e]'
  } ${isSubItem ? 'ml-6' : ''}`}
  >
    {icon && (
      <span className={`shrink-0 transition-colors ${active ? 'text-[#3ecf8e]' : 'group-hover:text-[#3ecf8e]'}`}>
        {icon}
      </span>
    )}
    <span className="text-[13px] font-medium truncate tracking-tight">{label}</span>
    {active && !rightIcon && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#3ecf8e] shadow-[0_0_8px_rgba(62,207,142,0.6)]" />}
    {rightIcon && <span className="ml-auto shrink-0 transition-transform group-hover:text-[#fafafa]">{rightIcon}</span>}
  </div>
);

export default SidebarItem;
