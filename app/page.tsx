"use client";

import React, { useState } from 'react';
import { TransactionForm } from '../components/TransactionForm';
import { Transaction, TransactionType, AccountType, CashAccount, CashMutation, PaymentMethod } from '../types';
import { useAppData } from '../hooks/useAppData';
import { LoginView } from '../components/LoginView';
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
    user,
    authLoading,
    dataLoading,
    accounts, 
    mutations, 
    transactionHistory, 
    addAccount,
    updateAccount,
    removeAccount,
    processTransactionBatch,
    processInternalTransfer,
    processSimpleUpdate
  } = useAppData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTransactionType, setActiveTransactionType] = useState<TransactionType | null>(null);
  
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState<CashAccount | null>(null);
  const [showAddCapitalModal, setShowAddCapitalModal] = useState(false);
  
  const [isEditingAccount, setIsEditingAccount] = useState<CashAccount | null>(null);

  const [transferConfig, setTransferConfig] = useState({
    amount: '',
    description: '',
    sourceId: '',
    destId: '',
    feeType: 'FREE',
    manualFee: '',
    chargedTo: 'SOURCE'
  });

  // --- LOADING / AUTH STATE ---
  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-100"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bri-blue"></div></div>;
  if (!user) return <LoginView />;

  // --- HANDLERS (UPDATED FOR ASYNC FIREBASE) ---

  const handleTransactionSubmit = async (data: Transaction) => {
    // Construct Transaction Data
    const newTrx = { 
       ...data, 
       date: new Date().toLocaleString() // In real app, use serverTimestamp() inside hook
    };

    const mutationsToAdd: Omit<CashMutation, 'id'>[] = [];
    const accountUpdates: { id: string, amount: number }[] = [];

    // PROSES MUTASI GANDA
    if (data.type === TransactionType.TRANSFER_BANK && data.sourceAccountId) {
       // A. MUTASI KELUAR
       const outAmount = data.amount + data.adminFee;
       mutationsToAdd.push({
         date: new Date().toLocaleString(),
         type: 'OUT',
         amount: outAmount,
         description: `TRX Keluar: ${data.customerName} (${data.provider})`,
         sourceAccountId: data.sourceAccountId
       });
       accountUpdates.push({ id: data.sourceAccountId, amount: -outAmount });

       // B. MUTASI MASUK
       const totalTagihan = data.total;
       
       if (data.paymentMethod === PaymentMethod.TUNAI) {
          const tunaiAcc = accounts.find(a => a.type === AccountType.TUNAI);
          if (tunaiAcc) {
            mutationsToAdd.push({ date: new Date().toLocaleString(), type: 'IN', amount: totalTagihan, description: `Pembayaran Tunai: ${data.customerName}`, destinationAccountId: tunaiAcc.id });
            accountUpdates.push({ id: tunaiAcc.id, amount: totalTagihan });
          }
       } else if (data.paymentMethod === PaymentMethod.TRANSFER && data.paymentReceiverId) {
          mutationsToAdd.push({ date: new Date().toLocaleString(), type: 'IN', amount: totalTagihan, description: `Pembayaran Transfer: ${data.customerName}`, destinationAccountId: data.paymentReceiverId });
          accountUpdates.push({ id: data.paymentReceiverId, amount: totalTagihan });
       } else if (data.paymentMethod === PaymentMethod.SPLIT) {
          const cashAmt = parseCurrencyInput(data.splitCashAmount || '0');
          const trfAmt = parseCurrencyInput(data.splitTransferAmount || '0');
          const tunaiAcc = accounts.find(a => a.type === AccountType.TUNAI);
          
          if (cashAmt > 0 && tunaiAcc) {
             mutationsToAdd.push({ date: new Date().toLocaleString(), type: 'IN', amount: cashAmt, description: `Split (Tunai): ${data.customerName}`, destinationAccountId: tunaiAcc.id });
             accountUpdates.push({ id: tunaiAcc.id, amount: cashAmt });
          }
          if (trfAmt > 0 && data.paymentReceiverId) {
             mutationsToAdd.push({ date: new Date().toLocaleString(), type: 'IN', amount: trfAmt, description: `Split (Transfer): ${data.customerName}`, destinationAccountId: data.paymentReceiverId });
             accountUpdates.push({ id: data.paymentReceiverId, amount: trfAmt });
          }
       }

    } else {
       // Logic Sederhana (Non-Transfer) -> Masuk ke Tunai
       const tunaiAcc = accounts.find(a => a.type === AccountType.TUNAI);
       if(tunaiAcc) {
          mutationsToAdd.push({ date: new Date().toLocaleString(), type: 'IN', amount: data.total, description: `TRX Masuk: ${data.type}`, destinationAccountId: tunaiAcc.id });
          accountUpdates.push({ id: tunaiAcc.id, amount: data.total });
       }
    }

    try {
      await processTransactionBatch(newTrx, mutationsToAdd, accountUpdates);
      setActiveTransactionType(null);
    } catch (e) {
      console.error("Error saving transaction", e);
      alert("Gagal menyimpan transaksi. Periksa koneksi internet.");
    }
  };

  const handleSaveAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as AccountType;
    
    if (type === AccountType.TUNAI && accounts.some(a => a.type === AccountType.TUNAI && a.id !== isEditingAccount?.id)) {
      alert("Hanya boleh ada satu akun Kas Tunai (Fisik).");
      return;
    }

    const accountData = {
      name: formData.get('name') as string,
      type: type,
      balance: parseCurrencyInput(formData.get('balance') as string),
      minimumBalance: formData.get('minimumBalance') ? parseCurrencyInput(formData.get('minimumBalance') as string) : undefined,
      accountNumber: formData.get('accountNumber') as string || undefined,
      mdrPercent: type === AccountType.MERCHANT ? Number(formData.get('mdrPercent')) : undefined,
      settlementAccountId: type === AccountType.MERCHANT ? formData.get('settlementAccountId') as string : undefined
    };

    try {
      if (isEditingAccount) {
        await updateAccount(isEditingAccount.id, accountData);
      } else {
        await addAccount(accountData);
      }
      setShowAddAccountModal(false);
      setIsEditingAccount(null);
    } catch (e) {
      alert("Gagal menyimpan akun.");
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus akun ini? Data tidak bisa dikembalikan.')) {
       await removeAccount(id);
    }
  };

  const handleCapitalInjection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const destId = formData.get('destId') as string;
    const amount = parseCurrencyInput(formData.get('amount') as string);
    const desc = formData.get('description') as string;

    if (!destId) { alert("Pilih akun tujuan."); return; }

    const mutationData = {
      date: new Date().toLocaleString(),
      type: 'CAPITAL_IN' as any,
      amount: amount,
      description: desc || 'Tambah Modal',
      destinationAccountId: destId
    };

    await processSimpleUpdate(mutationData, destId, amount);
    setShowAddCapitalModal(false);
  };

  const handleTransfer = async (e: React.FormEvent) => {
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
    const amountReceived = chargedTo === 'DESTINATION' ? parsedAmount - fee : parsedAmount;
    
    if (!sourceAcc || sourceAcc.balance < totalDeductionFromSource) { alert(`Saldo akun asal tidak mencukupi.`); return; }

    const mutationData = {
      date: new Date().toLocaleString(),
      type: 'TRANSFER' as any,
      amount: parsedAmount,
      fee: fee,
      description: description || `Mutasi (${feeType})`,
      sourceAccountId: sourceId,
      destinationAccountId: destId
    };

    await processInternalTransfer(mutationData, sourceId, destId, -totalDeductionFromSource, amountReceived);
    
    setShowTransferModal(false);
    setTransferConfig({ amount: '', description: '', sourceId: '', destId: '', feeType: 'FREE', manualFee: '', chargedTo: 'SOURCE' });
  };

  const handleSettlement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showSettlementModal) return;
    const formData = new FormData(e.currentTarget);
    const amount = parseCurrencyInput(formData.get('amount') as string);
    if (amount > showSettlementModal.balance) { alert("Saldo tidak mencukupi."); return; }

    const mdrFee = amount * ((showSettlementModal.mdrPercent || 0) / 100);
    const netAmount = amount - mdrFee;
    const destId = showSettlementModal.settlementAccountId;

    if (!destId) { alert("Akun tujuan settlement belum diset."); return; }

    const mutationData = {
      date: new Date().toLocaleString(),
      type: 'SETTLEMENT' as any,
      amount: amount,
      fee: mdrFee,
      description: `Settlement ${showSettlementModal.name}`,
      sourceAccountId: showSettlementModal.id,
      destinationAccountId: destId
    };

    await processInternalTransfer(mutationData, showSettlementModal.id, destId, -amount, netAmount);
    setShowSettlementModal(null);
  };

  return (
    <div className="min-h-screen relative font-sans text-slate-900">
      <AppHeader />

      <main className="w-full p-4 md:p-8 pb-32 max-w-7xl mx-auto">
        {dataLoading && <div className="text-center py-2 text-xs text-slate-400 animate-pulse">Mensinkronisasi data dengan cloud...</div>}

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