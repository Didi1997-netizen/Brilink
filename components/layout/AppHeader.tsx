import React from 'react';
import { CreditCard } from 'lucide-react';

export const AppHeader: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-bri-blue p-1.5 rounded-lg">
          <CreditCard className="text-white" size={20} />
        </div>
        <h1 className="text-lg font-bold text-bri-dark tracking-tight">AgenLink Pro</h1>
      </div>
      <div className="text-xs font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        Online
      </div>
    </header>
  );
};