import React from 'react';

const SidebarItem = ({ icon, label, active, onClick, isSubItem, rightIcon }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-all group ${
    active ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
  } ${isSubItem ? 'ml-6' : ''}`}>
    {icon && <span className={`shrink-0 transition-colors ${active ? 'text-[#1D9E75]' : 'group-hover:text-slate-300'}`}>{icon}</span>}
    <span className="text-xs font-medium truncate">{label}</span>
    {active && !rightIcon && <div className="ml-auto w-1 h-1 rounded-full bg-[#1D9E75]" />}
    {rightIcon && <span className="ml-auto shrink-0 transition-transform">{rightIcon}</span>}
  </div>
);

export default SidebarItem;
