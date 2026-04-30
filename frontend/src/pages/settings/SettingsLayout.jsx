import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import SettingsSidebar from '../../components/SettingsSidebar';

const SettingsLayout = () => {
  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 font-sans flex flex-col overflow-hidden h-screen">
      <Navbar showSearch={false} />
      <div className="flex flex-1 overflow-hidden">
        <SettingsSidebar />
        <main className="flex-1 overflow-y-auto bg-[#0f1117]">
          <div className="max-w-5xl px-4 sm:px-12 py-8 sm:py-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;
