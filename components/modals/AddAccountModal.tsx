import React from 'react';
import { X } from 'lucide-react';
import { AccountType, CashAccount } from '../../types';

interface AddAccountModalProps {
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditingAccount: CashAccount | null;
  accounts: CashAccount[];
}

const formatCurrencyInput = (value: string) => {
  const number = value.replace(/\D/g, '');
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ onClose, onSave, isEditingAccount, accounts }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">{isEditingAccount ? 'Edit Akun' : 'Tambah Akun'}</h3>
            <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
          </div>
          <form onSubmit={onSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Akun</label>
              <input name="name" type="text" defaultValue={isEditingAccount?.name} placeholder="Contoh: BRImo A, Kas Laci Utama" className="w-full p-2.5 border border-slate-300 rounded-xl" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipe Akun</label>
              <select 
                name="type" 
                defaultValue={isEditingAccount?.type || AccountType.DIGITAL} 
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                onChange={(e) => {
                  const val = e.target.value;
                  const mdrField = document.getElementById('mdr-field');
                  const setField = document.getElementById('settlement-field');
                  if (val === AccountType.MERCHANT) {
                      if(mdrField) mdrField.style.display = 'block';
                      if(setField) setField.style.display = 'block';
                  } else {
                      if(mdrField) mdrField.style.display = 'none';
                      if(setField) setField.style.display = 'none';
                  }
                }}
              >
                <option value={AccountType.DIGITAL}>Digital (Bank/E-Wallet)</option>
                {(isEditingAccount?.type === AccountType.TUNAI || !accounts.some(a => a.type === AccountType.TUNAI)) && <option value={AccountType.TUNAI}>Tunai (Fisik)</option>}
                <option value={AccountType.MERCHANT}>Merchant (EDC/QRIS)</option>
              </select>
            </div>
            
             {/* Merchant Specifics */}
             <div id="mdr-field" style={{display: isEditingAccount?.type === AccountType.MERCHANT ? 'block' : 'none'}}>
                <label className="block text-sm font-medium text-slate-700 mb-1">MDR Fee (%)</label>
                <input name="mdrPercent" type="number" step="0.01" defaultValue={isEditingAccount?.mdrPercent} placeholder="0.7" className="w-full p-2.5 border border-slate-300 rounded-xl" />
              </div>
              <div id="settlement-field" style={{display: isEditingAccount?.type === AccountType.MERCHANT ? 'block' : 'none'}}>
                <label className="block text-sm font-medium text-slate-700 mb-1">Akun Tujuan Settlement</label>
                <select name="settlementAccountId" defaultValue={isEditingAccount?.settlementAccountId} className="w-full p-2.5 border border-slate-300 rounded-xl bg-white">
                  <option value="">Pilih Akun...</option>
                  {accounts.filter(a => a.type === AccountType.DIGITAL).map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Saldo Saat Ini</label>
                <input name="balance" type="text" defaultValue={isEditingAccount ? formatCurrencyInput(isEditingAccount.balance.toString()) : ''} className="w-full p-2.5 border border-slate-300 rounded-xl font-mono" required onChange={(e) => e.target.value = formatCurrencyInput(e.target.value)}/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Saldo Minimum</label>
                <input name="minimumBalance" type="text" defaultValue={isEditingAccount?.minimumBalance ? formatCurrencyInput(isEditingAccount.minimumBalance.toString()) : ''} className="w-full p-2.5 border border-slate-300 rounded-xl font-mono" onChange={(e) => e.target.value = formatCurrencyInput(e.target.value)}/>
              </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">No. Rekening (Opsional)</label>
                <input name="accountNumber" type="text" defaultValue={isEditingAccount?.accountNumber} className="w-full p-2.5 border border-slate-300 rounded-xl" />
              </div>
            <button type="submit" className="w-full bg-bri-blue text-white py-3 rounded-xl font-bold mt-4 hover:bg-bri-dark transition-colors">{isEditingAccount ? 'Simpan Perubahan' : 'Simpan Akun Baru'}</button>
          </form>
        </div>
    </div>
  );
};