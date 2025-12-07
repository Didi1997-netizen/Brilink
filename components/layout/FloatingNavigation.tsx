import React, { useState } from 'react';
import { LayoutDashboard, History, Wallet, FileText, LogOut, X, Menu } from 'lucide-react';

interface FloatingNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const FloatingNavigation: React.FC<FloatingNavigationProps> = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'history', label: 'Riwayat Transaksi', icon: <History size={20} /> },
    { id: 'cash_account', label: 'Akun Kas', icon: <Wallet size={20} /> },
    { id: 'reports', label: 'Laporan', icon: <FileText size={20} /> },
  ];

  return (
    <>
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40" 
          onClick={() => setIsMenuOpen(false)} 
        />
      )}
      
      <div className={`fixed bottom-24 right-6 z-50 transition-all duration-300 ease-out origin-bottom-right transform ${isMenuOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}>
        <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[2.5rem] p-4 w-72 ring-1 ring-black/5">
            <div className="flex items-center gap-3 p-4 mb-2 bg-slate-50/50 rounded-3xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-bri-orange to-yellow-400 flex items-center justify-center font-bold text-white text-sm shadow-sm">AD</div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">Agen Budi</p>
                <p className="text-xs text-slate-500 truncate">ID: 88291002</p>
              </div>
            </div>

            <nav className="space-y-1">
            {navItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }} 
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-bri-blue text-white shadow-lg' : 'text-slate-600 hover:bg-white'}`}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
            </nav>

             <div className="h-px bg-slate-200 my-2 mx-4"></div>
             <button className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={20} />
              <span className="text-sm font-medium">Keluar Aplikasi</span>
            </button>
        </div>
      </div>
      
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)} 
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-xl flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 ${isMenuOpen ? 'bg-slate-800 rotate-90' : 'bg-bri-blue'}`}
      >
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
    </>
  );
};