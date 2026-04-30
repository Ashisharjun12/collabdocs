import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Eye, Edit3, ShieldAlert, Trash2 } from 'lucide-react';
import { Separator } from "../ui/separator";

const RoleSelector = ({ value, onChange, onRemove, isCompact = false }) => {
  const roles = [
    { 
      id: 'viewer', 
      label: 'Viewer', 
      description: 'Can view and comment', 
      icon: Eye 
    },
    { 
      id: 'editor', 
      label: 'Editor', 
      description: 'Can organize, add and edit files', 
      icon: Edit3 
    },
    { 
      id: 'admin', 
      label: 'Admin', 
      description: 'Full access to manage workspace', 
      icon: ShieldAlert 
    },
  ];

  const handleValueChange = (val) => {
    if (val === 'remove' && onRemove) {
      onRemove();
    } else {
      onChange(val);
    }
  };

  if (isCompact) {
    return (
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-auto h-8 bg-transparent border-none hover:bg-white/5 rounded-md text-[11px] font-bold text-slate-400 hover:text-white gap-1 focus:ring-0 shadow-none px-2 transition-all">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent className="bg-[#13151f] border-[#1e2130] text-slate-200 shadow-2xl min-w-[120px]">
          {roles.map((role) => (
            <SelectItem 
              key={role.id} 
              value={role.id}
              className="py-2 focus:bg-[#1D9E75]/10 focus:text-[#1D9E75] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <role.icon className="w-3 h-3" />
                <span className="font-bold text-[11px]">{role.label}</span>
              </div>
            </SelectItem>
          ))}
          {onRemove && (
            <>
              <div className="h-px bg-[#1e2130] my-1" />
              <SelectItem 
                value="remove"
                className="py-2 focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-400"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-3 h-3" />
                  <span className="font-bold text-[11px]">Remove access</span>
                </div>
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full h-12 bg-[#13151f] border-[#1e2130] rounded-xl text-slate-200 focus:ring-[#1D9E75]/20">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent className="bg-[#13151f] border-[#1e2130] text-slate-200 shadow-2xl">
        {roles.map((role) => (
          <SelectItem 
            key={role.id} 
            value={role.id}
            className="flex flex-col items-start gap-0.5 py-3 focus:bg-[#1D9E75]/10 focus:text-[#1D9E75] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <role.icon className="w-3.5 h-3.5" />
              <span className="font-bold text-sm">{role.label}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium ml-5.5">
              {role.description}
            </p>
          </SelectItem>
        ))}
        {onRemove && (
          <>
            <div className="h-px bg-[#1e2130] my-1" />
            <SelectItem 
              value="remove"
              className="py-3 focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-400"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5" />
                <span className="font-bold text-sm">Remove access</span>
              </div>
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
};

export default RoleSelector;
