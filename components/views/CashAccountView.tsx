import React, { useState } from 'react';
import { ChevronLeft, Banknote, Landmark, Store, ArrowRightLeft, Edit2, Trash2, RefreshCcw, ArrowRight, TrendingUp, Plus, ChevronRight, AlertTriangle } from 'lucide-react';
import { AccountType, CashAccount, CashMutation } from '../../types';

interface CashAccountViewProps {
  accounts: CashAccount[];
  mutations: CashMutation[];
  onAddAccount: () => void;
  onEditAccount: (acc: CashAccount) => void;
  onDeleteAccount: (id: string) => void;
  onTransfer: (sourceId?: string) => void;
  onSettlement: (acc: CashAccount) => void;
  onAddCapital: () => void;
}

export const CashAccountView: React.FC<CashAccountViewProps> = ({
  accounts,
  mutations,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onTransfer,
  onSettlement,
  onAddCapital
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [accountCategoryFilter, setAccountCategoryFilter] = useState<string>('ALL');

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  // VIEW 1: DETAILS
  if (selectedAccount) {
    const accountMutations = mutations.filter(m => m.sourceAccountId === selectedAccount.id || m.destinationAccountId === selectedAccount.id);
    return (
      <div className="animate-fade-in pb-24">
        <button onClick={() => setSelectedAccountId(null)} className="flex items-center gap-2 text-slate-500 hover:text-bri-blue mb-6 font-medium">
          <ChevronLeft size={20} /> Kembali ke Daftar
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-xl ${
                selectedAccount.type === AccountType.TUNAI ? 'bg-gradient-to-br from-emerald-500 to-teal-700' : 
                selectedAccount.type === AccountType.DIGITAL ? 'bg-gradient-to-br from-blue-600 to-indigo-800' : 
                'bg-gradient-to-br from-orange-500 to-red-700'
            }`}>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                      <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                        {selectedAccount.type === AccountType.TUNAI ? <Banknote size={24}/> : 
                          selectedAccount.type === AccountType.DIGITAL ? <Landmark size={24}/> : <Store size={24}/>}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider bg-black/20 px-2 py-1 rounded-lg">{selectedAccount.type}</span>
                  </div>
                  <p className="text-white/80 text-sm font-medium mb-1">{selectedAccount.name}</p>
                  <h2 className="text-3xl font-mono font-bold tracking-tight mb-4">Rp {selectedAccount.balance.toLocaleString('id-ID')}</h2>
                  {selectedAccount.accountNumber && <p className="font-mono text-white/60 tracking-widest">{selectedAccount.accountNumber}</p>}
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
            </div>
            
            <div className="flex gap-3">
                <button onClick={() => onTransfer(selectedAccount.id)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 font-medium text-slate-700 flex items-center justify-center gap-2"><ArrowRightLeft size={18}/> Transfer</button>
                <button onClick={() => onEditAccount(selectedAccount)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 font-medium text-slate-700 flex items-center justify-center gap-2"><Edit2 size={18}/> Edit</button>
                <button onClick={() => onDeleteAccount(selectedAccount.id)} className="py-3 px-4 bg-red-50 border border-red-100 rounded-xl shadow-sm hover:bg-red-100 text-red-600"><Trash2 size={18}/></button>
            </div>
            
            {selectedAccount.type === AccountType.MERCHANT && (
                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                  <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2"><RefreshCcw size={16}/> Auto Settlement</h4>
                  <button onClick={() => onSettlement(selectedAccount)} className="w-full py-2 bg-orange-600 text-white rounded-lg font-medium text-sm hover:bg-orange-700">Cairkan Sekarang</button>
                </div>
            )}
          </div>
          
          <div className="lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Riwayat Mutasi</h3>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {accountMutations.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(mut => {
                    const isIn = mut.destinationAccountId === selectedAccount.id;
                    return (
                      <div key={mut.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mut.type === 'CAPITAL_IN' ? 'bg-purple-100 text-purple-600' : isIn ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                              {mut.type === 'CAPITAL_IN' ? <TrendingUp size={16} /> :
                                isIn ? <ArrowRight size={16} className="rotate-45" /> : <ArrowRight size={16} className="-rotate-45"/>}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{mut.description}</p>
                              <p className="text-xs text-slate-400">{mut.date}</p>
                            </div>
                          </div>
                          <p className={`font-mono font-bold ${isIn ? 'text-green-600' : 'text-slate-800'}`}>{isIn ? '+' : '-'} Rp {mut.amount.toLocaleString('id-ID')}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: LIST
  const filteredAccounts = accountCategoryFilter === 'ALL' ? accounts : accounts.filter(a => a.type === accountCategoryFilter);

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold text-slate-800">Brankas Akun</h2><p className="text-slate-500 text-sm">Kelola aset dan arus kas</p></div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['ALL', AccountType.TUNAI, AccountType.DIGITAL, AccountType.MERCHANT].map((cat) => (
            <button key={cat} onClick={() => setAccountCategoryFilter(cat)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${accountCategoryFilter === cat ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>{cat === 'ALL' ? 'Semua Akun' : cat}</button>
          ))}
          </div>
          <div className="flex gap-2">
            <button onClick={onAddCapital} className="flex items-center gap-1 px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 shadow-lg"><TrendingUp size={16} /> Tambah Modal</button>
            <button onClick={onAddAccount} className="flex items-center gap-1 px-4 py-2 rounded-full bg-bri-blue text-white text-sm font-medium hover:bg-bri-dark shadow-lg"><Plus size={16} /> Akun Baru</button>
          </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => {
          const isLowBalance = acc.minimumBalance && acc.balance < acc.minimumBalance;
          return (
          <div key={acc.id} onClick={() => setSelectedAccountId(acc.id)} className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden ${isLowBalance ? 'border-red-200 ring-2 ring-red-100' : 'border-slate-100'}`}>
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className={`p-2.5 rounded-xl text-white shadow-md ${acc.type === AccountType.TUNAI ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : acc.type === AccountType.DIGITAL ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-orange-400 to-orange-600'}`}>
                    {acc.type === AccountType.TUNAI ? <Banknote size={20}/> : acc.type === AccountType.DIGITAL ? <Landmark size={20}/> : <Store size={20}/>}
                  </div>
                  <div className="flex gap-2">
                     {isLowBalance && <AlertTriangle size={20} className="text-red-500 animate-pulse" />}
                     <ChevronRight size={20} className="text-slate-300 group-hover:text-bri-blue transition-colors"/>
                  </div>
                </div>
                <div className="relative z-10">
                  <h4 className="font-bold text-slate-700 truncate">{acc.name}</h4>
                  <p className="text-xs text-slate-400 font-mono mb-2 truncate">
                     {acc.type} {acc.accountNumber ? `• ${acc.accountNumber}` : ''}
                  </p>
                  <p className={`text-xl font-bold tracking-tight ${isLowBalance ? 'text-red-600' : 'text-slate-900'}`}>Rp {acc.balance.toLocaleString('id-ID')}</p>
                </div>
                 {/* Subtle background decoration */}
                 <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity ${
                    acc.type === AccountType.TUNAI ? 'bg-emerald-500' : 
                    acc.type === AccountType.DIGITAL ? 'bg-blue-500' : 'bg-orange-500'
                 }`}></div>
          </div>
        )})}
      </div>
    </div>
  );
};