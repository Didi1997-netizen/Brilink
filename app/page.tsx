"use client";

import React, { useState } from 'react';
import { TransactionForm } from '../components/TransactionForm';
import { Transaction, TransactionType, AccountType, CashAccount, CashMutation, PaymentMethod } from '../types';
import { useAppData } from '../hooks/useAppData';
import { AppHeader } from '../components/layout/AppHeader';
import { FloatingNavigation } from '../components/layout/FloatingNavigation';
import { DashboardView } from '../components/views/DashboardView';
import { HistoryView } from '../components/views/HistoryView';
import { CashAccountView } from '../components/views/CashAccountView';
import { AddAccountModal } from '../components/modals/AddAccountModal';
import { TransferModal } from '../components/modals/TransferModal';
import { SettlementModal } from '../components/modals/SettlementModal';
import { CapitalModal } from '../components/modals/CapitalModal';

const parseCurrencyInput = (value: string) => {
  return Number(value.replace(/\./g, ''));
};

export default function Home() {
  const { 
    accounts, setAccounts, 
    mutations, setMutations, 
    transactionHistory, setTransactionHistory 
  } = useAppData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTransactionType, setActiveTransactionType] = useState<TransactionType | null>(null);
  
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState<CashAccount | null>(null);
  const [showAddCapitalModal, setShowAddCapitalModal] = useState(false);
  
  const [isEditingAccount, setIsEditingAccount] = useState<CashAccount | null>(null);

  // Transfer Logic State
  const [transferConfig, setTransferConfig] = useState({
    amount: '',
    description: '',
    sourceId: '',
    destId: '',
    feeType: 'FREE',
    manualFee: '',
    chargedTo: 'SOURCE'
  });

  // --- HANDLERS ---

  const handleTransactionSubmit = (data: Transaction) => {
    // 1. Simpan Transaksi
    const newTrx = { ...data, id: `TRX-${Date.now()}`, date: new Date().toLocaleString() };
    setTransactionHistory(prev => [newTrx, ...prev]);

    // 2. PROSES MUTASI GANDA
    if (data.type === TransactionType.TRANSFER_BANK && data.sourceAccountId) {
       // A. MUTASI KELUAR
       const outAmount = data.amount + data.adminFee;
       const outMutation: CashMutation = {
         id: `MUT-OUT-${Date.now()}`,
         date: new Date().toLocaleString(),
         type: 'OUT',
         amount: outAmount,
         description: `TRX Keluar: ${data.customerName} (${data.provider})`,
         sourceAccountId: data.sourceAccountId
       };

       // B. MUTASI MASUK
       const totalTagihan = data.total;
       const inMutations: CashMutation[] = [];

       if (data.paymentMethod === PaymentMethod.TUNAI) {
          const tunaiAcc = accounts.find(a => a.type === AccountType.TUNAI);
          if (tunaiAcc) {
            inMutations.push({ id: `MUT-IN-${Date.now()}-1`, date: new Date().toLocaleString(), type: 'IN', amount: totalTagihan, description: `Pembayaran Tunai: ${data.customerName}`, destinationAccountId: tunaiAcc.id });
          }
       } else if (data.paymentMethod === PaymentMethod.TRANSFER && data.paymentReceiverId) {
          inMutations.push({ id: `MUT-IN-${Date.now()}-1`, date: new Date().toLocaleString(), type: 'IN', amount: totalTagihan, description: `Pembayaran Transfer: ${data.customerName}`, destinationAccountId: data.paymentReceiverId });
       } else if (data.paymentMethod === PaymentMethod.SPLIT) {
          const cashAmt = parseCurrencyInput(data.splitCashAmount || '0');
          const trfAmt = parseCurrencyInput(data.splitTransferAmount || '0');
          const tunaiAcc = accounts.find(a => a.type === AccountType.TUNAI);
          
          if (cashAmt > 0 && tunaiAcc) inMutations.push({ id: `MUT-IN-${Date.now()}-1`, date: new Date().toLocaleString(), type: 'IN', amount: cashAmt, description: `Split (Tunai): ${data.customerName}`, destinationAccountId: tunaiAcc.id });
          if (trfAmt > 0 && data.paymentReceiverId) inMutations.push({ id: `MUT-IN-${Date.now()}-2`, date: new Date().toLocaleString(), type: 'IN', amount: trfAmt, description: `Split (Transfer): ${data.customerName}`, destinationAccountId: data.paymentReceiverId });
       }

       setMutations(prev => [outMutation, ...inMutations, ...prev]);
       setAccounts(prevAccounts => {
          return prevAccounts.map(acc => {
             let newBalance = acc.balance;
             if (acc.id === outMutation.sourceAccountId) newBalance -= outMutation.amount;
             inMutations.forEach(m => { if (acc.id === m.destinationAccountId) newBalance += m.amount; });
             return { ...acc, balance: newBalance };
          });
       });

    } else {
       // Logic Sederhana (Non-Transfer) -> Masuk ke Tunai
       const tunaiAcc = accounts.find(a => a.type === AccountType.TUNAI);
       if(tunaiAcc) {
          setAccounts(prev => prev.map(a => a.id === tunaiAcc.id ? {...a, balance: a.balance + data.total} : a));
          setMutations(prev => [...prev, { id: `MUT-IN-${Date.now()}`, date: new Date().toLocaleString(), type: 'IN', amount: data.total, description: `TRX Masuk: ${data.type}`, destinationAccountId: tunaiAcc.id }]);
       }
    }
    setActiveTransactionType(null);
  };

  // Account Management Handlers
  const handleSaveAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as AccountType;
    const balanceInput = formData.get('balance') as string;
    const minBalanceInput = formData.get('minimumBalance') as string;
    
    if (type === AccountType.TUNAI && accounts.some(a => a.type === AccountType.TUNAI && a.id !== isEditingAccount?.id)) {
      alert("Hanya boleh ada satu akun Kas Tunai (Fisik).");
      return;
    }

    const accountData: CashAccount = {
      id: isEditingAccount ? isEditingAccount.id : `ACC-${Date.now()}`,
      name: formData.get('name') as string,
      type: type,
      balance: parseCurrencyInput(balanceInput),
      minimumBalance: minBalanceInput ? parseCurrencyInput(minBalanceInput) : undefined,
      accountNumber: formData.get('accountNumber') as string || undefined,
      mdrPercent: type === AccountType.MERCHANT ? Number(formData.get('mdrPercent')) : undefined,
      settlementAccountId: type === AccountType.MERCHANT ? formData.get('settlementAccountId') as string : undefined
    };

    if (isEditingAccount) {
      setAccounts(accounts.map(acc => acc.id === isEditingAccount.id ? accountData : acc));
    } else {
      setAccounts([...accounts, accountData]);
    }
    setShowAddAccountModal(false);
    setIsEditingAccount(null);
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm('Yakin ingin menghapus akun ini?')) setAccounts(accounts.filter(a => a.id !== id));
  };

  const handleCapitalInjection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const destId = formData.get('destId') as string;
    const amount = parseCurrencyInput(formData.get('amount') as string);
    const desc = formData.get('description') as string;

    if (!destId) { alert("Pilih akun tujuan."); return; }

    setAccounts(accounts.map(acc => acc.id === destId ? { ...acc, balance: acc.balance + amount } : acc));
    setMutations(prev => [...prev, { id: `CAP-${Date.now()}`, date: new Date().toLocaleString(), type: 'CAPITAL_IN', amount: amount, description: desc || 'Tambah Modal', destinationAccountId: destId }]);
    setShowAddCapitalModal(false);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const { sourceId, destId, amount, description, feeType, manualFee, chargedTo } = transferConfig;

    if (sourceId === destId) { alert("Akun asal dan tujuan tidak boleh sama."); return; }

    const parsedAmount = parseCurrencyInput(amount);
    let fee = 0;
    if (feeType === 'BIFAST') fee = 2500;
    else if (feeType === 'ONLINE') fee = 6500;
    else if (feeType === 'MANUAL') fee = parseCurrencyInput(manualFee);

    const sourceAcc = accounts.find(a => a.id === sourceId);
    const totalDeductionFromSource = chargedTo === 'SOURCE' ? parsedAmount + fee : parsedAmount;
    
    if (!sourceAcc || sourceAcc.balance < totalDeductionFromSource) { alert(`Saldo akun asal tidak mencukupi.`); return; }

    setAccounts(accounts.map(acc => {
      if (acc.id === sourceId) return { ...acc, balance: acc.balance - totalDeductionFromSource };
      if (acc.id === destId) {
        const amountReceived = chargedTo === 'DESTINATION' ? parsedAmount - fee : parsedAmount;
        return { ...acc, balance: acc.balance + amountReceived };
      }
      return acc;
    }));

    setMutations(prev => [...prev, { id: `MUT-${Date.now()}`, date: new Date().toLocaleString(), type: 'TRANSFER', amount: parsedAmount, fee: fee, description: description || `Mutasi (${feeType})`, sourceAccountId: sourceId, destinationAccountId: destId }]);
    setShowTransferModal(false);
    setTransferConfig({ amount: '', description: '', sourceId: '', destId: '', feeType: 'FREE', manualFee: '', chargedTo: 'SOURCE' });
  };

  const handleSettlement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showSettlementModal) return;
    const formData = new FormData(e.currentTarget);
    const amount = parseCurrencyInput(formData.get('amount') as string);
    if (amount > showSettlementModal.balance) { alert("Saldo tidak mencukupi."); return; }

    const mdrFee = amount * ((showSettlementModal.mdrPercent || 0) / 100);
    const netAmount = amount - mdrFee;
    const destId = showSettlementModal.settlementAccountId;

    if (!destId) { alert("Akun tujuan settlement belum diset."); return; }

    setAccounts(accounts.map(acc => {
      if (acc.id === showSettlementModal.id) return { ...acc, balance: acc.balance - amount };
      if (acc.id === destId) return { ...acc, balance: acc.balance + netAmount };
      return acc;
    }));

    setMutations(prev => [...prev, { id: `SET-${Date.now()}`, date: new Date().toLocaleString(), type: 'SETTLEMENT', amount: amount, fee: mdrFee, description: `Settlement ${showSettlementModal.name}`, sourceAccountId: showSettlementModal.id, destinationAccountId: destId }]);
    setShowSettlementModal(null);
  };

  return (
    <div className="min-h-screen relative font-sans text-slate-900">
      <AppHeader />

      <main className="w-full p-4 md:p-8 pb-32 max-w-7xl mx-auto">
        {/* Modals & Overlays */}
        {activeTransactionType && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <TransactionForm type={activeTransactionType} accounts={accounts} onCancel={() => setActiveTransactionType(null)} onSubmit={handleTransactionSubmit} />
            </div>
          </div>
        )}

        {showAddAccountModal && <AddAccountModal onClose={() => {setShowAddAccountModal(false); setIsEditingAccount(null);}} onSave={handleSaveAccount} isEditingAccount={isEditingAccount} accounts={accounts} />}
        {showTransferModal && <TransferModal onClose={() => setShowTransferModal(false)} onTransfer={handleTransfer} accounts={accounts} config={transferConfig} setConfig={setTransferConfig} />}
        {showSettlementModal && <SettlementModal onClose={() => setShowSettlementModal(null)} onSettlement={handleSettlement} account={showSettlementModal} accounts={accounts} />}
        {showAddCapitalModal && <CapitalModal onClose={() => setShowAddCapitalModal(false)} onSave={handleCapitalInjection} accounts={accounts} />}

        {/* Main Content Based on Active Tab */}
        {activeTab === 'dashboard' && <DashboardView accounts={accounts} onServiceClick={setActiveTransactionType} />}
        {activeTab === 'history' && <HistoryView transactions={transactionHistory} />}
        {activeTab === 'cash_account' && (
          <CashAccountView 
            accounts={accounts} 
            mutations={mutations} 
            onAddAccount={() => { setIsEditingAccount(null); setShowAddAccountModal(true); }}
            onEditAccount={(acc) => { setIsEditingAccount(acc); setShowAddAccountModal(true); }}
            onDeleteAccount={handleDeleteAccount}
            onTransfer={(sourceId) => { setTransferConfig(prev => ({ ...prev, sourceId: sourceId || '' })); setShowTransferModal(true); }}
            onSettlement={setShowSettlementModal}
            onAddCapital={() => setShowAddCapitalModal(true)}
          />
        )}
        {activeTab === 'reports' && <div className="text-center p-8 text-slate-500 bg-white rounded-xl border border-slate-200">Laporan & Analitik (Segera Hadir)</div>}
      </main>

      <FloatingNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}