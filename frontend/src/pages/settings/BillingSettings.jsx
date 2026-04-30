import React from 'react';
import { CreditCard } from 'lucide-react';

const BillingSettings = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-in fade-in duration-500">
      <div className="w-16 h-16 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center border border-[#1D9E75]/20 mb-6">
        <CreditCard className="w-8 h-8 text-[#1D9E75]" />
      </div>
      <h1 className="text-2xl font-black text-white tracking-tight mb-2">Billing & Plans</h1>
      <p className="text-slate-500 font-medium italic">Coming Soon</p>
    </div>
  );
};

export default BillingSettings;

