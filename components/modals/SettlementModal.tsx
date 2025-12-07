import React from 'react';
import { X } from 'lucide-react';
import { CashAccount } from '../../types';

interface SettlementModalProps {
  onClose: () => void;
  onSettlement: (e: React.FormEvent<HTMLFormElement>) => void;
  account: CashAccount | null;
  accounts: CashAccount[];
}

const formatCurrencyInput = (value: string) => {
  const number = value.replace(/\D/g, '');
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const SettlementModal: React.FC<SettlementModalProps> = ({ onClose, onSettlement, account, accounts }) => {
  if (!account) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border-t-4 border-orange-500">
          <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-xl font-bold text-slate-800">Settlement Merchant</h3>
                <p className="text-sm text-slate-500">{account.name}</p>
            </div>
            <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
          </div>
          <form onSubmit={onSettlement} className="space-y-4">
             <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Saldo Saat Ini:</span>
                  <span className="font-mono font-bold">Rp {account.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Biaya MDR ({account.mdrPercent}%):</span>
                  <span className="font-mono text-red-500">Otomatis dipotong</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Akun Tujuan:</span>
                  <span className="font-bold">{accounts.find(a => a.id === account.settlementAccountId)?.name || 'Belum diset'}</span>
                </div>
              </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Nominal Settlement (Rp)</label>
               <input name="amount" defaultValue={formatCurrencyInput(account.balance.toString())} className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-lg" required onChange={(e) => e.target.value = formatCurrencyInput(e.target.value)} />
            </div>
            <button type="submit" className="w-full py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors">Settlement</button>
          </form>
        </div>
    </div>
  );
};