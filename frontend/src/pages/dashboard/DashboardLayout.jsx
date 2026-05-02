import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Sheet, SheetContent } from '../../components/ui/sheet';

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-[#171717] text-slate-200 font-sans flex flex-col overflow-hidden">

      <Navbar onMenuClick={() => setIsMobileOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden relative">

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
           <Sidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side="left" className="p-0 w-64 bg-[#1c1c1c] border-r border-[#242424]">
            <Sidebar onClose={() => setIsMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};


export default DashboardLayout;
