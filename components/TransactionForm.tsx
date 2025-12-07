"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TransactionType, BANK_GROUPS, EWALLET_LIST, EMONEY_LIST, CashAccount, PaymentMethod, AccountType } from '../types';
import { Save, RefreshCw, AlertCircle, Search, CheckCircle, RotateCcw, X, Wallet, CreditCard, Banknote, SplitSquareHorizontal } from 'lucide-react';

interface TransactionFormProps {
  type: TransactionType;
  accounts: CashAccount[];
  onCancel: () => void;
  onSubmit: (data: any) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ type, accounts, onCancel, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // --- STATE PENCARIAN & UI ---
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [isBankListVisible, setIsBankListVisible] = useState(false);
  
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  const [isAccountListVisible, setIsAccountListVisible] = useState(false);

  // --- STATE DATA TRANSAKSI ---
  const [formData, setFormData] = useState({
    sourceAccountId: '', // Akun Asal (Untuk Transfer)
    provider: '', 
    accountNumber: '', 
    customerName: '',
    amount: '', // Nominal Transfer
    agentFee: '', // Biaya Jasa
    adminFeeBank: '', // Biaya Admin Bank (New)
    
    // Payment Logic
    paymentMethod: PaymentMethod.TUNAI,
    paymentReceiverId: '', // Akun penerima pembayaran (jika Transfer)
    splitCashAmount: '', // Jika Split: Nominal Tunai
    splitTransferAmount: '', // Jika Split: Nominal Transfer
  });

  // --- REFS (FOCUS MANAGEMENT) ---
  const sourceAccountRef = useRef<HTMLInputElement>(null);
  const providerRef = useRef<HTMLInputElement>(null); // Bank search input
  const providerSelectRef = useRef<HTMLSelectElement>(null);
  const customerNameRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const adminBankRef = useRef<HTMLInputElement>(null);
  const agentFeeRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  // --- DERIVED DATA ---
  
  // List Bank Flattened
  const allBanks = useMemo(() => [
    ...BANK_GROUPS.BUMN, ...BANK_GROUPS.SWASTA, ...BANK_GROUPS.DIGITAL, ...BANK_GROUPS.BPD, ...BANK_GROUPS.SYARIAH
  ], []);

  const filteredBanks = useMemo(() => {
    if (!bankSearchTerm) return [];
    return allBanks.filter(bank => bank.toLowerCase().includes(bankSearchTerm.toLowerCase()));
  }, [bankSearchTerm, allBanks]);

  // List Akun Flattened
  const filteredAccounts = useMemo(() => {
    if (!accountSearchTerm) return accounts;
    return accounts.filter(acc => acc.name.toLowerCase().includes(accountSearchTerm.toLowerCase()));
  }, [accountSearchTerm, accounts]);

  // Auto-Select Tunai Account
  const tunaiAccount = useMemo(() => accounts.find(a => a.type === AccountType.TUNAI), [accounts]);

  // Helper Format
  const formatCurrency = (value: string) => value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const parseRaw = (value: string) => parseInt(value.replace(/\./g, '') || '0');

  // Autofocus saat mount
  useEffect(() => {
    if (type === TransactionType.TRANSFER_BANK) {
      sourceAccountRef.current?.focus();
    } else {
      providerSelectRef.current?.focus();
    }
  }, [type, showSuccessDialog]);

  // Auto-Hitung Fee Agen
  useEffect(() => {
    const rawAmount = parseRaw(formData.amount);
    let fee = 0;
    
    // Logika Fee Sederhana (Bisa disesuaikan dengan aturan kompleks)
    if (type === TransactionType.TARIK_KJP) {
      if (rawAmount <= 512000 && rawAmount > 0) fee = 5000; // Simplifikasi contoh
    } else if (type === TransactionType.TOPUP_EWALLET || type === TransactionType.TRANSFER_BANK) {
      if (rawAmount > 0) {
          if (rawAmount <= 1000000) fee = 5000;
          else if (rawAmount <= 3000000) fee = 10000;
          else fee = 15000;
      }
    }

    if (fee > 0) {
       setFormData(prev => ({ ...prev, agentFee: formatCurrency(fee.toString()) }));
    }
  }, [formData.amount, type]);

  // --- CALCULATION TOTALS ---
  const nominal = parseRaw(formData.amount);
  const feeAgen = parseRaw(formData.agentFee);
  const feeAdmin = parseRaw(formData.adminFeeBank);
  const totalTagihan = nominal + feeAgen + feeAdmin;

  // Auto-Fill Split Transfer Amount
  useEffect(() => {
    if (formData.paymentMethod === PaymentMethod.SPLIT) {
      const cash = parseRaw(formData.splitCashAmount);
      const remaining = totalTagihan - cash;
      if (remaining >= 0) {
        setFormData(prev => ({...prev, splitTransferAmount: formatCurrency(remaining.toString())}));
      } else {
        setFormData(prev => ({...prev, splitTransferAmount: '0'}));
      }
    }
  }, [formData.splitCashAmount, totalTagihan, formData.paymentMethod]);


  // --- HANDLERS ---

  const handleSourceAccountSelect = (acc: CashAccount) => {
    setFormData({ ...formData, sourceAccountId: acc.id });
    setAccountSearchTerm(acc.name);
    setIsAccountListVisible(false);
    // Focus next
    if (type === TransactionType.TRANSFER_BANK) {
       setTimeout(() => providerRef.current?.focus(), 100);
    } else {
       setTimeout(() => providerSelectRef.current?.focus(), 100);
    }
  };

  const handleBankSelect = (bankName: string) => {
    setFormData({ ...formData, provider: bankName });
    setBankSearchTerm(bankName);
    setIsBankListVisible(false);
    setTimeout(() => customerNameRef.current?.focus(), 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (['amount', 'agentFee', 'adminFeeBank', 'splitCashAmount', 'splitTransferAmount'].includes(name)) {
      setFormData({ ...formData, [name]: formatCurrency(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRepeatTransaction = () => {
    setFormData({
      sourceAccountId: '', provider: '', accountNumber: '', customerName: '', amount: '', agentFee: '', adminFeeBank: '',
      paymentMethod: PaymentMethod.TUNAI, paymentReceiverId: '', splitCashAmount: '', splitTransferAmount: ''
    });
    setAccountSearchTerm('');
    setBankSearchTerm('');
    setShowSuccessDialog(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDASI KHUSUS TRANSFER
    if (type === TransactionType.TRANSFER_BANK) {
      if (!formData.sourceAccountId) {
        alert("Harap pilih Akun Kas yang digunakan untuk mengirim dana.");
        return;
      }
      
      const sourceAcc = accounts.find(a => a.id === formData.sourceAccountId);
      const requiredBalance = nominal + feeAdmin; // Uang yang keluar dari rekening agen
      if (sourceAcc && sourceAcc.balance < requiredBalance) {
         alert(`Saldo akun ${sourceAcc.name} tidak mencukupi. Butuh: ${requiredBalance.toLocaleString()}`);
         return;
      }
    }

    // VALIDASI PEMBAYARAN
    if (formData.paymentMethod === PaymentMethod.TRANSFER && !formData.paymentReceiverId) {
      alert("Harap pilih Akun Penerima untuk pembayaran transfer.");
      return;
    }
    if (formData.paymentMethod === PaymentMethod.SPLIT) {
       if (!formData.paymentReceiverId) {
         alert("Harap pilih Akun Penerima untuk sisa pembayaran transfer.");
         return;
       }
       if (parseRaw(formData.splitCashAmount) + parseRaw(formData.splitTransferAmount) !== totalTagihan) {
         alert("Total Split (Tunai + Transfer) tidak sesuai dengan Total Tagihan.");
         return;
       }
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccessDialog(true);
    }, 800);
  };

  const handleFinalSubmit = () => {
     onSubmit({
       ...formData,
       amount: nominal,
       agentFee: feeAgen,
       adminFee: feeAdmin,
       total: totalTagihan,
       type
     });
  };

  // --- RENDER SUB-COMPONENTS ---

  const renderSourceAccountSelection = () => (
    <div className="relative z-30">
       <label className="block text-sm font-bold text-slate-700 mb-1">
          {type === TransactionType.TRANSFER_BANK ? '1. Pilih Akun Kas Sumber (Dana Keluar)' : 'Pilih Akun Kas'}
       </label>
       <div className="relative">
         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
           <Wallet size={18} className="text-slate-400" />
         </div>
         <input
            ref={sourceAccountRef}
            type="text"
            placeholder="Cari akun kas..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-bri-blue focus:border-transparent outline-none bg-slate-50 focus:bg-white transition-all font-medium"
            value={accountSearchTerm}
            onChange={(e) => {
              setAccountSearchTerm(e.target.value);
              setIsAccountListVisible(true);
              setFormData({...formData, sourceAccountId: ''});
            }}
            onFocus={() => setIsAccountListVisible(true)}
            onKeyDown={(e) => {
               if(e.key === 'Enter' && filteredAccounts.length > 0) {
                 e.preventDefault();
                 handleSourceAccountSelect(filteredAccounts[0]);
               }
            }}
         />
         {formData.sourceAccountId && !isAccountListVisible && (
            <div className="absolute right-3 top-3 text-green-600">
               <CheckCircle size={20} />
            </div>
         )}
       </div>
       {/* Dropdown Akun */}
       {isAccountListVisible && (
         <div className="absolute w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-40">
            {filteredAccounts.map(acc => (
              <div 
                key={acc.id}
                onClick={() => handleSourceAccountSelect(acc)}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0"
              >
                <div className="font-bold text-slate-800">{acc.name}</div>
                <div className="flex justify-between text-xs mt-1">
                   <span className="text-slate-500">{acc.type}</span>
                   <span className={`font-mono font-medium ${acc.balance < (nominal || 0) ? 'text-red-500' : 'text-green-600'}`}>
                     Rp {acc.balance.toLocaleString()}
                   </span>
                </div>
              </div>
            ))}
         </div>
       )}
    </div>
  );

  const renderPaymentMethod = () => (
    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
       <label className="block text-sm font-bold text-slate-700">Metode Pembayaran (Terima Dana)</label>
       
       <div className="grid grid-cols-3 gap-2">
          {[
            { id: PaymentMethod.TUNAI, icon: <Banknote size={20}/>, label: 'Tunai' },
            { id: PaymentMethod.TRANSFER, icon: <CreditCard size={20}/>, label: 'Transfer' },
            { id: PaymentMethod.SPLIT, icon: <SplitSquareHorizontal size={20}/>, label: 'Split' },
          ].map(m => (
            <button
              type="button"
              key={m.id}
              onClick={() => setFormData({...formData, paymentMethod: m.id})}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                formData.paymentMethod === m.id 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
               {m.icon}
               <span className="text-xs font-bold mt-1">{m.label}</span>
            </button>
          ))}
       </div>

       {/* Logic based on Payment Method */}
       <div className="animate-fade-in mt-3">
          {formData.paymentMethod === PaymentMethod.TUNAI && (
             <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 p-3 rounded-lg border border-green-200">
                <CheckCircle size={16}/> 
                <span>Masuk otomatis ke <b>{tunaiAccount?.name || 'Akun Tunai'}</b></span>
             </div>
          )}

          {(formData.paymentMethod === PaymentMethod.TRANSFER || formData.paymentMethod === PaymentMethod.SPLIT) && (
             <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    {formData.paymentMethod === PaymentMethod.SPLIT ? 'Akun Penerima (Sisa Transfer)' : 'Akun Penerima Pembayaran'}
                  </label>
                  <select
                    name="paymentReceiverId"
                    value={formData.paymentReceiverId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                    required
                  >
                    <option value="">-- Pilih Akun Penerima --</option>
                    {accounts.filter(a => a.type !== AccountType.TUNAI).map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                
                {formData.paymentMethod === PaymentMethod.SPLIT && (
                   <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Bayar Tunai</label>
                        <input 
                           type="text" 
                           name="splitCashAmount"
                           value={formData.splitCashAmount} 
                           onChange={handleInputChange}
                           className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                           placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Bayar Transfer</label>
                        <input 
                           type="text" 
                           name="splitTransferAmount"
                           value={formData.splitTransferAmount} 
                           readOnly
                           className="w-full px-3 py-2 border rounded-lg font-mono text-sm bg-slate-100 text-slate-500"
                        />
                      </div>
                   </div>
                )}
             </div>
          )}
       </div>
    </div>
  );

  if (showSuccessDialog) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden text-center p-8 animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Transaksi Disimpan!</h3>
        <p className="text-slate-500 mb-8">Mutasi ganda telah dicatat sesuai metode pembayaran.</p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleRepeatTransaction}
            className="w-full py-3.5 bg-bri-blue text-white rounded-xl font-bold text-lg hover:bg-bri-dark flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <RotateCcw size={20} /> Transaksi Lagi
          </button>
          <button 
            onClick={handleFinalSubmit}
            className="w-full py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
      <div className="bg-bri-blue text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {type}
        </h3>
        <button onClick={onCancel} className="text-white/80 hover:text-white text-sm">Tutup</button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
        
        {/* STEP 1: SOURCE ACCOUNT */}
        {renderSourceAccountSelection()}

        {/* STEP 2: DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
           {/* Kiri: Tujuan & Identitas */}
           <div className="space-y-4">
              {type === TransactionType.TRANSFER_BANK ? (
                 <div className="relative">
                   <label className="block text-sm font-bold text-slate-700 mb-1">2. Bank Tujuan</label>
                   <div className="relative">
                      <input
                        ref={providerRef}
                        type="text"
                        placeholder="Ketik nama bank..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-bri-blue outline-none"
                        value={bankSearchTerm}
                        onChange={(e) => {
                          setBankSearchTerm(e.target.value);
                          setIsBankListVisible(true);
                          setFormData({...formData, provider: ''});
                        }}
                        onFocus={() => setIsBankListVisible(true)}
                        onKeyDown={(e) => {
                           if(e.key === 'Enter' && filteredBanks.length > 0) {
                             e.preventDefault();
                             handleBankSelect(filteredBanks[0]);
                           }
                        }}
                      />
                      <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                      {formData.provider && !isBankListVisible && (
                        <div className="absolute right-3 top-3 text-green-600"><CheckCircle size={16}/></div>
                      )}
                   </div>
                   {isBankListVisible && bankSearchTerm && (
                     <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {filteredBanks.map((bank, i) => (
                           <div key={i} onClick={() => handleBankSelect(bank)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium border-b border-slate-50">{bank}</div>
                        ))}
                     </div>
                   )}
                 </div>
              ) : (
                // PROVIDER LAIN (NON-TRANSFER)
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Provider / Layanan</label>
                   <select 
                     ref={providerSelectRef}
                     name="provider" 
                     className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white"
                     value={formData.provider}
                     onChange={handleInputChange}
                   >
                     <option value="">-- Pilih --</option>
                     {type === TransactionType.TOPUP_EWALLET && EWALLET_LIST.map(e => <option key={e} value={e}>{e}</option>)}
                     {type === TransactionType.TOPUP_EMONEY && EMONEY_LIST.map(e => <option key={e} value={e}>{e}</option>)}
                   </select>
                </div>
              )}

              {/* No Rekening - Hidden for Transfer Bank as requested previously */}
              {type !== TransactionType.TRANSFER_BANK && (
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Tujuan</label>
                    <input type="text" inputMode="numeric" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-bri-blue outline-none"/>
                 </div>
              )}

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Nama Pelanggan / Penerima</label>
                 <input 
                   ref={customerNameRef}
                   type="text" 
                   name="customerName" 
                   value={formData.customerName} 
                   onChange={handleInputChange} 
                   className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-bri-blue outline-none"
                   onKeyDown={(e) => { if(e.key === 'Enter') amountRef.current?.focus(); }}
                 />
              </div>
           </div>

           {/* Kanan: Nominal & Biaya */}
           <div className="space-y-4">
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">3. Nominal Transfer</label>
                 <input 
                   ref={amountRef}
                   type="text" 
                   inputMode="numeric" 
                   name="amount" 
                   value={formData.amount} 
                   onChange={handleInputChange} 
                   className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-bri-blue outline-none font-mono text-lg"
                   placeholder="0"
                   onKeyDown={(e) => { if(e.key === 'Enter') agentFeeRef.current?.focus(); }}
                 />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Biaya Layanan (Agen)</label>
                    <input 
                      ref={agentFeeRef}
                      type="text" 
                      inputMode="numeric" 
                      name="agentFee" 
                      value={formData.agentFee} 
                      onChange={handleInputChange} 
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-yellow-50 focus:bg-white transition-colors"
                      onKeyDown={(e) => { if(e.key === 'Enter') adminBankRef.current?.focus(); }}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Bank (Baru)</label>
                    <input 
                      ref={adminBankRef}
                      type="text" 
                      inputMode="numeric" 
                      name="adminFeeBank" 
                      value={formData.adminFeeBank} 
                      onChange={handleInputChange} 
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-200"
                      placeholder="0"
                    />
                 </div>
              </div>

              {/* Total Summary */}
              <div className="bg-slate-800 text-white p-4 rounded-xl shadow-lg">
                 <div className="flex justify-between items-center text-sm opacity-80 mb-1">
                    <span>Nominal + Admin Bank</span>
                    <span>Rp {(nominal + feeAdmin).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm opacity-80 mb-2">
                    <span>Biaya Layanan</span>
                    <span>+ Rp {feeAgen.toLocaleString()}</span>
                 </div>
                 <div className="h-px bg-white/20 my-2"></div>
                 <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Tagihan</span>
                    <span>Rp {totalTagihan.toLocaleString()}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* STEP 4: PAYMENT METHOD */}
        {renderPaymentMethod()}

      </form>
      
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-white transition-colors">Batal</button>
          <button 
             ref={submitRef} 
             onClick={handleSubmit} 
             disabled={isLoading}
             className="px-6 py-2.5 rounded-xl bg-bri-blue text-white font-bold hover:bg-bri-dark transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
          >
             {isLoading ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18}/>}
             Simpan Transaksi
          </button>
      </div>
    </div>
  );
};