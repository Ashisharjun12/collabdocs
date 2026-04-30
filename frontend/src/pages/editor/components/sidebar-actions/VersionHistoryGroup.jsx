import React, { useState } from 'react';
import { History, ChevronRight } from 'lucide-react';
import SidebarItem from './SidebarItem';
import NameVersionAction from './NameVersionAction';
import VersionHistoryAction from './VersionHistoryAction';

const VersionHistoryGroup = ({ onEnterHistoryMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col">
      <SidebarItem
        icon={<History className="w-4 h-4" />}
        label="Version history"
        rightIcon={
          <ChevronRight 
            className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
          />
        }
        onClick={() => setIsExpanded(!isExpanded)}
      />
      
      {isExpanded && (
        <div className="flex flex-col mt-0.5 space-y-0.5 animate-in slide-in-from-top-1 fade-in duration-200">
          <NameVersionAction />
          <VersionHistoryAction onEnterHistoryMode={onEnterHistoryMode} />
        </div>
      )}
    </div>
  );
};

export default VersionHistoryGroup;
