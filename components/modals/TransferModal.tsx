import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CashAccount } from '../../types';

interface TransferModalProps {
  onClose: () => void;
  onTransfer: (e: React.FormEvent) => void;
  accounts: CashAccount[];
  initialSourceId?: string;
  config: any;
  setConfig: (config: any) => void;
}

const formatCurrencyInput = (value: string) => {
  const number = value.replace(/\D/g, '');
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const TransferModal: React.FC<TransferModalProps> = ({ onClose, onTransfer, accounts, config, setConfig }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Mutasi / Pindah Dana</h3>
            <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
          </div>
          <form onSubmit={onTransfer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dari Akun</label>
                  <select name="sourceId" value={config.sourceId} onChange={(e) => setConfig({...config, sourceId: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-sm" required>
                    <option value="">Pilih...</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.balance.toLocaleString()})</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ke Akun</label>
                  <select name="destId" value={config.destId} onChange={(e) => setConfig({...config, destId: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-sm" required>
                    <option value="">Pilih...</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal (Rp)</label>
              <input name="amount" value={config.amount} onChange={(e) => setConfig({...config, amount: formatCurrencyInput(e.target.value)})} className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-lg" required placeholder="0" />
            </div>

             {/* FEE SECTION */}
             <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">Biaya Perpindahan</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[
                    { id: 'FREE', label: 'Rp 0', sub: 'Gratis' },
                    { id: 'BIFAST', label: 'Rp 2.500', sub: 'BI-FAST' },
                    { id: 'ONLINE', label: 'Rp 6.500', sub: 'Online' },
                    { id: 'MANUAL', label: 'Manual', sub: 'Input' },
                  ].map((opt) => (
                    <div 
                      key={opt.id}
                      onClick={() => setConfig({...config, feeType: opt.id})}
                      className={`cursor-pointer p-2 rounded-lg border text-center transition-all ${
                        config.feeType === opt.id 
                        ? 'bg-blue-50 border-bri-blue text-bri-blue ring-1 ring-bri-blue' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-bold">{opt.label}</div>
                      <div className="text-[10px] uppercase text-slate-400">{opt.sub}</div>
                    </div>
                  ))}
                </div>
                
                {config.feeType === 'MANUAL' && (
                    <input 
                    type="text"
                    placeholder="Masukkan nominal biaya..."
                    value={config.manualFee}
                    onChange={(e) => setConfig({...config, manualFee: formatCurrencyInput(e.target.value)})}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm mb-2"
                  />
                )}

                {config.feeType !== 'FREE' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">Terpotong di</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="radio" name="chargedTo" checked={config.chargedTo === 'SOURCE'} onChange={() => setConfig({...config, chargedTo: 'SOURCE'})} className="text-bri-blue focus:ring-bri-blue"/>
                          <span className="text-slate-700">Akun Asal</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="radio" name="chargedTo" checked={config.chargedTo === 'DESTINATION'} onChange={() => setConfig({...config, chargedTo: 'DESTINATION'})} className="text-bri-blue focus:ring-bri-blue"/>
                          <span className="text-slate-700">Akun Tujuan</span>
                        </label>
                    </div>
                  </div>
                )}
              </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan</label>
               <input name="description" type="text" value={config.description} onChange={(e) => setConfig({...config, description: e.target.value})} placeholder="Contoh: Setor Modal, Prive" className="w-full p-2.5 border border-slate-300 rounded-xl" />
            </div>

            <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold mt-4 hover:bg-slate-900 transition-colors">Proses Mutasi</button>
          </form>
        </div>
    </div>
  );
};