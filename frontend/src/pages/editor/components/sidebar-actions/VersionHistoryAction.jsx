import React from 'react';
import { History } from 'lucide-react';
import SidebarItem from './SidebarItem';

const VersionHistoryAction = ({ onEnterHistoryMode }) => {
  return (
    <SidebarItem
      icon={<History className="w-4 h-4" />}
      label="See version history"
      isSubItem={true}
      onClick={onEnterHistoryMode}
    />
  );
};

export default VersionHistoryAction;
