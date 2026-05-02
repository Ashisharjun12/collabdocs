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
        <SelectTrigger className="w-auto h-8 bg-transparent border-none hover:bg-[#242424] rounded-md text-[11px] font-medium text-[#898989] hover:text-[#fafafa] gap-1 focus:ring-0 shadow-none px-2 transition-all">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent className="bg-[#1c1c1c] border-[#2e2e2e] text-[#fafafa] shadow-2xl min-w-[140px] rounded-lg">
          {roles.map((role) => (
            <SelectItem 
              key={role.id} 
              value={role.id}
              className="py-2 focus:bg-[#242424] focus:text-[#3ecf8e] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <role.icon className="w-3 h-3" />
                <span className="font-medium text-[11px] tracking-tight">{role.label}</span>
              </div>
            </SelectItem>
          ))}
          {onRemove && (
            <>
              <div className="h-px bg-[#2e2e2e] my-1" />
              <SelectItem 
                value="remove"
                className="py-2 focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-400"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-3 h-3" />
                  <span className="font-medium text-[11px] tracking-tight">Remove Access</span>
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
      <SelectTrigger className="w-full h-11 bg-[#171717] border border-[#2e2e2e] rounded-lg text-[#fafafa] focus:ring-[#3ecf8e]/20 transition-all font-medium text-[13px]">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent className="bg-[#1c1c1c] border-[#2e2e2e] text-[#fafafa] shadow-2xl rounded-lg">
        {roles.map((role) => (
          <SelectItem 
            key={role.id} 
            value={role.id}
            className="flex flex-col items-start gap-0.5 py-3 focus:bg-[#242424] focus:text-[#3ecf8e] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <role.icon className="w-3.5 h-3.5" />
              <span className="font-medium text-[13px] tracking-tight">{role.label}</span>
            </div>
            <p className="text-[11px] text-[#898989] font-normal ml-5.5">
              {role.description}
            </p>
          </SelectItem>
        ))}
        {onRemove && (
          <>
            <div className="h-px bg-[#2e2e2e] my-1" />
            <SelectItem 
              value="remove"
              className="py-3 focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-400"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5" />
                <span className="font-medium text-[13px] tracking-tight">Remove Access</span>
              </div>
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
};

export default RoleSelector;
