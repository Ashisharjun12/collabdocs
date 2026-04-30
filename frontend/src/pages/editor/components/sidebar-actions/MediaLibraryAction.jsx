import React, { useState } from 'react';
import { FileText, FolderOpen } from 'lucide-react';
import SidebarItem from './SidebarItem';
import MediaLibraryModal from '../MediaLibraryModal';

const MediaLibraryAction = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <SidebarItem
        icon={<FolderOpen className="w-4 h-4" />}
        label="Open File"
        onClick={() => setIsOpen(true)}
      />
      
      <MediaLibraryModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default MediaLibraryAction;
