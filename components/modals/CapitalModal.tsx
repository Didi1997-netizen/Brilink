import React from 'react';
import { X } from 'lucide-react';
import { CashAccount } from '../../types';

interface CapitalModalProps {
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
  accounts: CashAccount[];
}

const formatCurrencyInput = (value: string) => {
  const number = value.replace(/\D/g, '');
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const CapitalModal: React.FC<CapitalModalProps> = ({ onClose, onSave, accounts }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border-t-4 border-purple-500">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="text-xl font-bold text-slate-800">Tambah Modal / Suntik Dana</h3>
                <p className="text-sm text-slate-500">Dana masuk dari eksternal (Bukan Mutasi)</p>
             </div>
            <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
          </div>
          <form onSubmit={onSave} className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Masuk ke Akun</label>
                <select name="destId" defaultValue="" className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-sm" required>
                  <option value="" disabled>Pilih Akun Tujuan...</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
             </div>
            <input name="amount" placeholder="Nominal" onChange={(e) => e.target.value = formatCurrencyInput(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-lg" required/>
            <input name="description" placeholder="Sumber Dana" className="w-full p-2.5 border border-slate-300 rounded-xl" required/>
            <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">Tambah</button>
          </form>
        </div>
    </div>
  );
};