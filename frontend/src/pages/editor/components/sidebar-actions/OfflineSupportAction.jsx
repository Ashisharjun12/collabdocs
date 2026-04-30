import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useDocStore } from '../../../../store/doc-store';
import SidebarItem from './SidebarItem';

const OfflineSupportAction = () => {
  const { isOfflineEnabled, toggleOfflineSupport } = useDocStore();

  return (
    <SidebarItem 
      icon={isOfflineEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />} 
      label="Offline Support" 
      onClick={toggleOfflineSupport} 
    />
  );
};

export default OfflineSupportAction;
