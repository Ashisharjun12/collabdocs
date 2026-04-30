import React from 'react';
import { Lock, Users, Globe } from 'lucide-react';
import { Label } from '../ui/label';

const VisibilityOption = ({ id, label, description, icon: Icon, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 text-center flex-1 ${
      isActive 
        ? 'bg-[#1D9E75]/5 border-[#1D9E75]/40 text-[#1D9E75]' 
        : 'bg-[#13151f] border-[#1e2130] text-slate-500 hover:border-[#2a2e40] hover:bg-white/5'
    }`}
  >
    <div className={`${isActive ? 'text-[#1D9E75]' : 'text-slate-500'}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex flex-col">
      <span className="text-[11px] font-bold tracking-tight">{label}</span>
      <span className="text-[9px] opacity-60 font-medium">{description}</span>
    </div>
  </div>
);

const VisibilitySelector = ({ value, onChange, disabled }) => {
  const options = [
    { id: 'private', label: 'private', description: 'only you', icon: Lock },
    { id: 'team', label: 'team', description: 'invite only', icon: Users },
    { id: 'public', label: 'public', description: 'anyone', icon: Globe },
  ];

  return (
    <div className="space-y-3">
      <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Visibility</Label>
      <div className="flex items-center gap-4">
        {options.map((option) => (
          <VisibilityOption
            key={option.id}
            {...option}
            isActive={value === option.id}
            onClick={() => !disabled && onChange(option.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default VisibilitySelector;
