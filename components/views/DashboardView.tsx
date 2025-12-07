import React, { useMemo } from 'react';
import { CreditCard, Wallet, Banknote, AlertTriangle, ArrowRightLeft, Smartphone, Zap, FileText, Droplets, Activity, Wifi, MoreHorizontal, Terminal, IdCard, Signal, CreditCard as CardIcon } from 'lucide-react';
import { CashAccount, TransactionType } from '../../types';

interface DashboardViewProps {
  accounts: CashAccount[];
  onServiceClick: (type: TransactionType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ accounts, onServiceClick }) => {
  const totalAssets = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);
  
  const lowBalanceAccounts = useMemo(() => {
    return accounts.filter(acc => acc.minimumBalance && acc.balance < acc.minimumBalance);
  }, [accounts]);

  const BRILINK_SERVICES = [
    { label: 'Transfer Bank', type: TransactionType.TRANSFER_BANK, icon: <ArrowRightLeft size={24} />, color: 'bg-gradient-to-br from-blue-500 to-blue-600', shadow: 'shadow-blue-200', desc: 'Semua Bank' },
    { label: 'Tarik Tunai Bank', type: TransactionType.TARIK_TUNAI_BANK, icon: <Banknote size={24} />, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-200', desc: 'Debit Card' },
    { label: 'Topup E-Wallet', type: TransactionType.TOPUP_EWALLET, icon: <Wallet size={24} />, color: 'bg-gradient-to-br from-violet-500 to-violet-600', shadow: 'shadow-violet-200', desc: 'GoPay, OVO, Dana' },
    { label: 'Tarik E-Wallet', type: TransactionType.TARIK_EWALLET, icon: <Wallet size={24} />, color: 'bg-gradient-to-br from-violet-700 to-violet-900', shadow: 'shadow-violet-200', desc: 'Cairkan Saldo' },
    { label: 'Bayar BRIVA', type: TransactionType.BRIVA, icon: <CreditCard size={24} />, color: 'bg-gradient-to-br from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-200', desc: 'Virtual Account' },
    { label: 'Sewa EDC', type: TransactionType.EDC_RENTAL, icon: <Terminal size={24} />, color: 'bg-gradient-to-br from-slate-600 to-slate-700', shadow: 'shadow-slate-200', desc: 'Rental / Mini ATM' },
    { label: 'Tarik KJP', type: TransactionType.TARIK_KJP, icon: <IdCard size={24} />, color: 'bg-gradient-to-br from-rose-500 to-rose-600', shadow: 'shadow-rose-200', desc: 'Kartu Jakarta Pintar' },
    { label: 'Kartu E-Money', type: TransactionType.TOPUP_EMONEY, icon: <CardIcon size={24} />, color: 'bg-gradient-to-br from-amber-500 to-amber-600', shadow: 'shadow-amber-200', desc: 'Update Saldo' },
  ];

  const PPOB_SERVICES = [
    { label: 'Pulsa', type: TransactionType.PULSA, icon: <Smartphone size={24} />, color: 'bg-gradient-to-br from-pink-500 to-rose-500', shadow: 'shadow-pink-200', desc: 'All Operator' },
    { label: 'Paket Data', type: TransactionType.DATA, icon: <Signal size={24} />, color: 'bg-gradient-to-br from-cyan-500 to-blue-500', shadow: 'shadow-cyan-200', desc: 'Internet' },
    { label: 'Token Listrik', type: TransactionType.PLN_TOKEN, icon: <Zap size={24} />, color: 'bg-gradient-to-br from-yellow-400 to-orange-500', shadow: 'shadow-yellow-200', desc: 'Prabayar' },
    { label: 'Tagihan Listrik', type: TransactionType.PLN_BILL, icon: <FileText size={24} />, color: 'bg-gradient-to-br from-orange-500 to-red-500', shadow: 'shadow-orange-200', desc: 'Pascabayar' },
    { label: 'PDAM', type: TransactionType.PDAM, icon: <Droplets size={24} />, color: 'bg-gradient-to-br from-sky-500 to-blue-600', shadow: 'shadow-sky-200', desc: 'Air Bersih' },
    { label: 'BPJS', type: TransactionType.BPJS, icon: <Activity size={24} />, color: 'bg-gradient-to-br from-green-500 to-teal-600', shadow: 'shadow-green-200', desc: 'Kesehatan' },
    { label: 'WiFi & Internet', type: TransactionType.DATA, icon: <Wifi size={24} />, color: 'bg-gradient-to-br from-purple-500 to-indigo-600', shadow: 'shadow-purple-200', desc: 'Indihome, dll' },
    { label: 'Lainnya', type: TransactionType.BRIVA, icon: <MoreHorizontal size={24} />, color: 'bg-gradient-to-br from-gray-500 to-slate-600', shadow: 'shadow-gray-200', desc: 'Multifinance, dll' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-bri-dark to-bri-blue rounded-3xl p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="relative z-10">
           <div className="flex justify-between items-start mb-6">
             <div>
                <h2 className="text-3xl font-bold mb-1 tracking-tight">Halo, Agen Budi!</h2>
                <p className="text-blue-100/90 text-lg">Siap melayani transaksi hari ini?</p>
             </div>
             <div className="hidden md:block bg-white/20 backdrop-blur-md p-2 rounded-xl">
                <CreditCard className="text-white" size={32} />
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-default">
               <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-blue-500/30 rounded-lg">
                   <Wallet size={18} className="text-white" />
                 </div>
                 <p className="text-sm text-blue-100 font-medium">Total Aset Kas</p>
               </div>
               <p className="font-mono text-2xl font-bold tracking-tight">Rp {totalAssets.toLocaleString('id-ID')}</p>
             </div>
             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-default">
                <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-yellow-500/30 rounded-lg">
                   <Banknote size={18} className="text-yellow-300" />
                 </div>
                 <p className="text-sm text-blue-100 font-medium">Komisi Hari Ini</p>
               </div>
               <p className="font-mono text-2xl font-bold text-yellow-300">+Rp 345.000</p>
             </div>
           </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      {lowBalanceAccounts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-fade-in shadow-sm">
           <div className="flex items-start gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                 <h4 className="text-red-800 font-bold">Perhatian: Saldo Akun Menipis</h4>
                 <div className="space-y-1 mt-1">
                   {lowBalanceAccounts.map(acc => (
                     <div key={acc.id} className="text-sm text-red-700">
                        <span className="font-medium">{acc.name}:</span> Rp {acc.balance.toLocaleString()} (Min: {acc.minimumBalance?.toLocaleString()})
                     </div>
                   ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Services Grid - BRILink */}
      <div>
        <div className="flex items-center gap-3 mb-6 px-1">
           <div className="w-1.5 h-8 bg-bri-blue rounded-full"></div>
           <div>
              <h3 className="text-xl font-bold text-slate-800">Layanan BRILink</h3>
              <p className="text-sm text-slate-500">Transaksi perbankan & keuangan</p>
           </div>
        </div>
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {BRILINK_SERVICES.map((item, idx) => (
            <button key={idx} onClick={() => onServiceClick(item.type)} className="bg-white p-2 md:p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col items-center text-center h-full">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${item.color} ${item.shadow} shadow-lg text-white flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform`}>{item.icon}</div>
              <div className="w-full">
                <h4 className="font-bold text-slate-800 text-xs md:text-sm leading-tight mb-1 group-hover:text-bri-blue transition-colors break-words">{item.label}</h4>
                <p className="hidden md:block text-xs text-slate-400 line-clamp-1">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Services Grid - PPOB */}
      <div>
         <div className="flex items-center gap-3 mb-6 px-1">
           <div className="w-1.5 h-8 bg-bri-orange rounded-full"></div>
           <div>
              <h3 className="text-xl font-bold text-slate-800">Layanan PPOB</h3>
              <p className="text-sm text-slate-500">Pembayaran tagihan & topup</p>
           </div>
        </div>
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {PPOB_SERVICES.map((item, idx) => (
            <button key={idx} onClick={() => onServiceClick(item.type)} className="bg-white p-2 md:p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col items-center text-center h-full">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${item.color} ${item.shadow} shadow-lg text-white flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform`}>{item.icon}</div>
              <div className="w-full">
                <h4 className="font-bold text-slate-800 text-xs md:text-sm leading-tight mb-1 group-hover:text-bri-orange transition-colors break-words">{item.label}</h4>
                <p className="hidden md:block text-xs text-slate-400 line-clamp-1">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};