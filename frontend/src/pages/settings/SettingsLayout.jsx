import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import SettingsSidebar from '../../components/SettingsSidebar';

const SettingsLayout = () => {
  return (
    <div className="min-h-screen bg-[#171717] text-[#fafafa] font-sans flex flex-col overflow-hidden h-screen">
      <Navbar showSearch={false} />
      <div className="flex flex-1 overflow-hidden">
        <SettingsSidebar />
        <main className="flex-1 overflow-y-auto bg-[#171717] custom-scrollbar">
          <div className="max-w-5xl px-6 sm:px-16 py-10 sm:py-16">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;
