import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  History, 
  Settings, 
  LogOut, 
  Wallet, 
  Users, 
  CreditCard,
  Zap,
  Smartphone,
  Droplets,
  Activity,
  Menu,
  X,
  Search,
  Filter,
  Download,
  Wifi,
  FileText,
  MoreHorizontal,
  Banknote,
  Terminal,
  IdCard,
  Signal,
  CreditCard as CardIcon,
  Plus,
  ArrowRight,
  Landmark,
  Store,
  RefreshCcw,
  Lock,
  ChevronLeft,
  Trash2,
  Edit2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { TransactionForm } from './components/TransactionForm';
import { Transaction, TransactionType, TransactionStatus, AccountType, CashAccount, CashMutation, PaymentMethod } from './types';

// --- MOCK DATA ---
const MOCK_HISTORY: Transaction[] = [
  { id: 'TRX-001', date: '2023-10-24 10:30', type: TransactionType.TRANSFER_BANK, customerName: 'Budi Santoso', accountNumber: '1234567890', amount: 500000, adminFee: 6500, agentFee: 5000, total: 511500, status: TransactionStatus.SUCCESS },
];

const INITIAL_ACCOUNTS: CashAccount[] = [
  { id: 'ACC-001', name: 'Kas Laci (Tunai)', type: AccountType.TUNAI, balance: 2500000, minimumBalance: 1000000 },
  { id: 'ACC-002', name: 'BRImo Ops', type: AccountType.DIGITAL, balance: 15000000, accountNumber: '1234-56-7890', minimumBalance: 5000000 },
  { id: 'ACC-003', name: 'myBCA', type: AccountType.DIGITAL, balance: 5000000, accountNumber: '8800112233', minimumBalance: 2000000 },
  { id: 'ACC-004', name: 'EDC BRI', type: AccountType.MERCHANT, balance: 2000000, mdrPercent: 0.5, settlementAccountId: 'ACC-002' },
];

// Helper: Format Currency Input
const formatCurrencyInput = (value: string) => {
  const number = value.replace(/\D/g, '');
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseCurrencyInput = (value: string) => {
  return Number(value.replace(/\./g, ''));
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTransactionType, setActiveTransactionType] = useState<TransactionType | null>(null);
  
  // Cash Account State with LocalStorage Persistence
  const [accounts, setAccounts] = useState<CashAccount[]>(() => {
    const saved = localStorage.getItem('agenlink_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [mutations, setMutations] = useState<CashMutation[]>(() => {
    const saved = localStorage.getItem('agenlink_mutations');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>(() => {
     const saved = localStorage.getItem('agenlink_history');
     return saved ? JSON.parse(saved) : MOCK_HISTORY;
  });

  // Save changes
  useEffect(() => { localStorage.setItem('agenlink_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('agenlink_mutations', JSON.stringify(mutations)); }, [mutations]);
  useEffect(() => { localStorage.setItem('agenlink_history', JSON.stringify(transactionHistory)); }, [transactionHistory]);

  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState<CashAccount | null>(null);
  const [showAddCapitalModal, setShowAddCapitalModal] = useState(false);
  
  // UI Selection State
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [accountCategoryFilter, setAccountCategoryFilter] = useState<string>('ALL');
  const [isEditingAccount, setIsEditingAccount] = useState<CashAccount | null>(null);

  // Derived Selected Account
  const selectedAccount = useMemo(() => 
    accounts.find(a => a.id === selectedAccountId) || null, 
  [accounts, selectedAccountId]);

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

  // --- MENU CONFIGURATION ---
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

  const handleServiceClick = (item: any) => {
    setActiveTransactionType(item.type);
  };

  const totalAssets = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);
  
  const lowBalanceAccounts = useMemo(() => {
    return accounts.filter(acc => acc.minimumBalance && acc.balance < acc.minimumBalance);
  }, [accounts]);

  // --- TRANSACTION SUBMISSION LOGIC (COMPLEX) ---
  const handleTransactionSubmit = (data: Transaction) => {
    console.log("Processing Transaction:", data);
    
    // 1. Simpan Transaksi
    const newTrx = { ...data, id: `TRX-${Date.now()}`, date: new Date().toLocaleString() };
    setTransactionHistory(prev => [newTrx, ...prev]);

    // 2. PROSES MUTASI GANDA
    if (data.type === TransactionType.TRANSFER_BANK && data.sourceAccountId) {
       // A. MUTASI KELUAR (DARI AKUN AGEN)
       const outAmount = data.amount + data.adminFee;
       
       const outMutation: CashMutation = {
         id: `MUT-OUT-${Date.now()}`,
         date: new Date().toLocaleString(),
         type: 'OUT',
         amount: outAmount,
         description: `TRX Keluar: ${data.customerName} (${data.provider})`,
         sourceAccountId: data.sourceAccountId
       };

       // B. MUTASI MASUK (PEMBAYARAN DARI CUSTOMER)
       const totalTagihan = data.total;
       const inMutations: CashMutation[] = [];

       if (data.paymentMethod === PaymentMethod.TUNAI) {
          const tunaiAcc = accounts.find(a => a.type === AccountType.TUNAI);
          if (tunaiAcc) {
            inMutations.push({
              id: `MUT-IN-${Date.now()}-1`,
              date: new Date().toLocaleString(),
              type: 'IN',
              amount: totalTagihan,
              description: `Pembayaran Tunai: ${data.customerName}`,
              destinationAccountId: tunaiAcc.id
            });
          }
       } else if (data.paymentMethod === PaymentMethod.TRANSFER) {
          if (data.paymentReceiverId) {
             inMutations.push({
               id: `MUT-IN-${Date.now()}-1`,
               date: new Date().toLocaleString(),
               type: 'IN',
               amount: totalTagihan,
               description: `Pembayaran Transfer: ${data.customerName}`,
               destinationAccountId: data.paymentReceiverId
             });
          }
       } else if (data.paymentMethod === PaymentMethod.SPLIT) {
          const splitData = data as any; 
          const cashAmt = parseCurrencyInput(splitData.splitCashAmount || '0');
          const trfAmt = parseCurrencyInput(splitData.splitTransferAmount || '0');
          
          const tunaiAcc = accounts.find(a => a.type === AccountType.TUNAI);
          
          if (cashAmt > 0 && tunaiAcc) {
             inMutations.push({
               id: `MUT-IN-${Date.now()}-1`,
               date: new Date().toLocaleString(),
               type: 'IN',
               amount: cashAmt,
               description: `Split (Tunai): ${data.customerName}`,
               destinationAccountId: tunaiAcc.id
             });
          }
          if (trfAmt > 0 && data.paymentReceiverId) {
             inMutations.push({
               id: `MUT-IN-${Date.now()}-2`,
               date: new Date().toLocaleString(),
               type: 'IN',
               amount: trfAmt,
               description: `Split (Transfer): ${data.customerName}`,
               destinationAccountId: data.paymentReceiverId
             });
          }
       }

       // 3. UPDATE SALDO AKUN
       const newMutations = [outMutation, ...inMutations];
       setMutations(prev => [...newMutations, ...prev]);

       setAccounts(prevAccounts => {
          return prevAccounts.map(acc => {
             let newBalance = acc.balance;
             if (acc.id === outMutation.sourceAccountId) {
                newBalance -= outMutation.amount;
             }
             inMutations.forEach(m => {
                if (acc.id === m.destinationAccountId) {
                   newBalance += m.amount;
                }
             });
             return { ...acc, balance: newBalance };
          });
       });

    } else {
       // Logic Sederhana (Untuk Transaksi Non-Transfer Bank)
       // Misal PPOB: Kurangi saldo opsional jika ada API integrasi, tapi untuk mock kita asumsikan Tunai masuk saja
       // Disini kita buat simplifikasi: Uang masuk ke TUNAI
       const tunaiAcc = accounts.find(a => a.type === AccountType.TUNAI);
       if(tunaiAcc) {
          setAccounts(prev => prev.map(a => a.id === tunaiAcc.id ? {...a, balance: a.balance + data.total} : a));
          setMutations(prev => [...prev, {
             id: `MUT-IN-${Date.now()}`,
             date: new Date().toLocaleString(),
             type: 'IN',
             amount: data.total,
             description: `TRX Masuk: ${data.type}`,
             destinationAccountId: tunaiAcc.id
          }]);
       }
    }

    setActiveTransactionType(null);
  };

  // --- CRUD ACTIONS ---
  
  // CREATE / UPDATE
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
      if (selectedAccountId === isEditingAccount.id) setSelectedAccountId(accountData.id); // Refresh selection logic
    } else {
      setAccounts([...accounts, accountData]);
    }
    
    setShowAddAccountModal(false);
    setIsEditingAccount(null);
  };

  // DELETE
  const handleDeleteAccount = (id: string) => {
    if (window.confirm('Yakin ingin menghapus akun ini?')) {
      setAccounts(accounts.filter(a => a.id !== id));
      setSelectedAccountId(null);
    }
  };

  // ADD CAPITAL
  const handleCapitalInjection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const destId = formData.get('destId') as string;
    const amount = parseCurrencyInput(formData.get('amount') as string);
    const desc = formData.get('description') as string;

    if (!destId) { alert("Pilih akun tujuan."); return; }

    setAccounts(accounts.map(acc => acc.id === destId ? { ...acc, balance: acc.balance + amount } : acc));
    setMutations(prev => [...prev, {
      id: `CAP-${Date.now()}`,
      date: new Date().toLocaleString(),
      type: 'CAPITAL_IN',
      amount: amount,
      description: desc || 'Tambah Modal',
      destinationAccountId: destId
    }]);
    setShowAddCapitalModal(false);
  };

  // MUTASI (TRANSFER)
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
    
    if (!sourceAcc || sourceAcc.balance < totalDeductionFromSource) {
      alert(`Saldo akun asal tidak mencukupi.`);
      return;
    }

    setAccounts(accounts.map(acc => {
      if (acc.id === sourceId) return { ...acc, balance: acc.balance - totalDeductionFromSource };
      if (acc.id === destId) {
        const amountReceived = chargedTo === 'DESTINATION' ? parsedAmount - fee : parsedAmount;
        return { ...acc, balance: acc.balance + amountReceived };
      }
      return acc;
    }));

    setMutations(prev => [...prev, {
      id: `MUT-${Date.now()}`,
      date: new Date().toLocaleString(),
      type: 'TRANSFER',
      amount: parsedAmount,
      fee: fee,
      description: description || `Mutasi (${feeType})`,
      sourceAccountId: sourceId,
      destinationAccountId: destId
    }]);
    setShowTransferModal(false);
    
    setTransferConfig({ amount: '', description: '', sourceId: '', destId: '', feeType: 'FREE', manualFee: '', chargedTo: 'SOURCE' });
  };

  // SETTLEMENT
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

    setMutations(prev => [...prev, {
      id: `SET-${Date.now()}`,
      date: new Date().toLocaleString(),
      type: 'SETTLEMENT',
      amount: amount,
      fee: mdrFee,
      description: `Settlement ${showSettlementModal.name}`,
      sourceAccountId: showSettlementModal.id,
      destinationAccountId: destId
    }]);
    setShowSettlementModal(null);
  };

  // --- RENDER HELPERS ---
  const renderDashboard = () => (
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

      {/* Services Grid */}
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
            <button key={idx} onClick={() => handleServiceClick(item)} className="bg-white p-2 md:p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col items-center text-center h-full">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${item.color} ${item.shadow} shadow-lg text-white flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform`}>{item.icon}</div>
              <div className="w-full">
                <h4 className="font-bold text-slate-800 text-xs md:text-sm leading-tight mb-1 group-hover:text-bri-blue transition-colors break-words">{item.label}</h4>
                <p className="hidden md:block text-xs text-slate-400 line-clamp-1">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      
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
            <button key={idx} onClick={() => handleServiceClick(item)} className="bg-white p-2 md:p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col items-center text-center h-full">
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

  const renderCashAccount = () => {
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
                 <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                 <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => { setTransferConfig({ ...transferConfig, sourceId: selectedAccount.id }); setShowTransferModal(true); }} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 font-medium text-slate-700 flex items-center justify-center gap-2"><ArrowRightLeft size={18}/> Transfer</button>
                 <button onClick={() => { setIsEditingAccount(selectedAccount); setShowAddAccountModal(true); }} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 font-medium text-slate-700 flex items-center justify-center gap-2"><Edit2 size={18}/> Edit</button>
                 <button onClick={() => handleDeleteAccount(selectedAccount.id)} className="py-3 px-4 bg-red-50 border border-red-100 rounded-xl shadow-sm hover:bg-red-100 text-red-600"><Trash2 size={18}/></button>
              </div>
              {selectedAccount.type === AccountType.MERCHANT && (
                 <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                    <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2"><RefreshCcw size={16}/> Auto Settlement</h4>
                    <button onClick={() => setShowSettlementModal(selectedAccount)} className="w-full py-2 bg-orange-600 text-white rounded-lg font-medium text-sm hover:bg-orange-700">Cairkan Sekarang</button>
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
                                {isIn ? <ArrowRight size={16} className="rotate-45" /> : <ArrowRight size={16} className="-rotate-45"/>}
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
              <button onClick={() => setShowAddCapitalModal(true)} className="flex items-center gap-1 px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 shadow-lg"><TrendingUp size={16} /> Tambah Modal</button>
              <button onClick={() => { setIsEditingAccount(null); setShowAddAccountModal(true); }} className="flex items-center gap-1 px-4 py-2 rounded-full bg-bri-blue text-white text-sm font-medium hover:bg-bri-dark shadow-lg"><Plus size={16} /> Akun Baru</button>
           </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((acc) => (
            <div key={acc.id} onClick={() => setSelectedAccountId(acc.id)} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                 <div className="flex justify-between items-start mb-3 relative z-10">
                   <div className={`p-2.5 rounded-xl text-white shadow-md ${acc.type === AccountType.TUNAI ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : acc.type === AccountType.DIGITAL ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-orange-400 to-orange-600'}`}>
                     {acc.type === AccountType.TUNAI ? <Banknote size={20}/> : acc.type === AccountType.DIGITAL ? <Landmark size={20}/> : <Store size={20}/>}
                   </div>
                   <ChevronRight size={20} className="text-slate-300 group-hover:text-bri-blue transition-colors"/>
                 </div>
                 <div className="relative z-10">
                   <h4 className="font-bold text-slate-700 truncate">{acc.name}</h4>
                   <p className="text-xl font-bold tracking-tight text-slate-900">Rp {acc.balance.toLocaleString('id-ID')}</p>
                 </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-800">Riwayat Transaksi</h2>
        <div className="flex gap-2">
           <input type="text" placeholder="Cari..." className="pl-4 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bri-blue"/>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr><th className="px-6 py-3">ID & Waktu</th><th className="px-6 py-3">Jenis</th><th className="px-6 py-3">Pelanggan</th><th className="px-6 py-3">Nominal</th><th className="px-6 py-3 text-right">Fee Agen</th><th className="px-6 py-3 text-center">Status</th></tr>
          </thead>
          <tbody>
            {transactionHistory.map((trx) => (
              <tr key={trx.id} className="bg-white border-b border-slate-50 hover:bg-slate-50">
                <td className="px-6 py-4"><div className="font-medium text-slate-900">{trx.id}</div><div className="text-slate-500 text-xs">{trx.date}</div></td>
                <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{trx.type}</span></td>
                <td className="px-6 py-4"><div className="font-medium">{trx.customerName}</div></td>
                <td className="px-6 py-4 font-mono font-medium text-slate-700">Rp {trx.amount.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 font-mono text-green-600 text-right">+Rp {trx.agentFee.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-center"><span className="px-2 py-1 rounded-full text-xs font-bold text-green-600 bg-green-50">{trx.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans text-slate-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="bg-bri-blue p-1.5 rounded-lg"><CreditCard className="text-white" size={20} /></div><h1 className="text-lg font-bold text-bri-dark tracking-tight">AgenLink Pro</h1></div>
          <div className="text-xs font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Online</div>
      </header>
      <main className="w-full p-4 md:p-8 pb-32 max-w-7xl mx-auto">
        {activeTransactionType && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl"><TransactionForm type={activeTransactionType} accounts={accounts} onCancel={() => setActiveTransactionType(null)} onSubmit={handleTransactionSubmit} /></div>
          </div>
        )}
        {showAddAccountModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-slate-800">{isEditingAccount ? 'Edit Akun' : 'Tambah Akun'}</h3><button onClick={() => { setShowAddAccountModal(false); setIsEditingAccount(null); }}><X size={24} className="text-slate-400" /></button></div>
                <form onSubmit={handleSaveAccount} className="space-y-4">
                  <div><label className="block text-sm font-medium mb-1">Nama</label><input name="name" type="text" defaultValue={isEditingAccount?.name} className="w-full p-2.5 border rounded-xl" required /></div>
                  <div><label className="block text-sm font-medium mb-1">Tipe</label>
                    <select name="type" defaultValue={isEditingAccount?.type || AccountType.DIGITAL} className="w-full p-2.5 border rounded-xl bg-white">
                      <option value={AccountType.DIGITAL}>Digital</option>
                      {(isEditingAccount?.type === AccountType.TUNAI || !accounts.some(a => a.type === AccountType.TUNAI)) && <option value={AccountType.TUNAI}>Tunai</option>}
                      <option value={AccountType.MERCHANT}>Merchant</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium mb-1">Saldo</label><input name="balance" type="text" defaultValue={isEditingAccount ? formatCurrencyInput(isEditingAccount.balance.toString()) : ''} className="w-full p-2.5 border rounded-xl" required onChange={(e) => e.target.value = formatCurrencyInput(e.target.value)}/></div>
                  <button type="submit" className="w-full bg-bri-blue text-white py-3 rounded-xl font-bold mt-4">Simpan</button>
                </form>
             </div>
          </div>
        )}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold mb-4">Mutasi Internal</h3>
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <select name="sourceId" value={transferConfig.sourceId} onChange={(e) => setTransferConfig({...transferConfig, sourceId: e.target.value})} className="w-full p-2 border rounded-xl"><option value="">Dari...</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
                    <select name="destId" value={transferConfig.destId} onChange={(e) => setTransferConfig({...transferConfig, destId: e.target.value})} className="w-full p-2 border rounded-xl"><option value="">Ke...</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
                  </div>
                  <input name="amount" value={transferConfig.amount} onChange={(e) => setTransferConfig({...transferConfig, amount: formatCurrencyInput(e.target.value)})} className="w-full p-2 border rounded-xl" placeholder="Rp 0" />
                  <button type="button" onClick={() => setShowTransferModal(false)} className="mr-2 px-4 py-2 text-slate-500">Batal</button>
                  <button type="submit" className="px-6 py-2 bg-slate-800 text-white rounded-xl">Proses</button>
                </form>
             </div>
          </div>
        )}
        {showSettlementModal && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-md p-6">
               <h3 className="text-xl font-bold mb-4">Settlement {showSettlementModal.name}</h3>
               <form onSubmit={handleSettlement}>
                  <input name="amount" defaultValue={formatCurrencyInput(showSettlementModal.balance.toString())} className="w-full p-2 border rounded-xl mb-4" />
                  <button type="submit" className="w-full py-2 bg-orange-600 text-white rounded-xl">Settlement</button>
               </form>
             </div>
           </div>
        )}
        {showAddCapitalModal && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-md p-6">
               <h3 className="text-xl font-bold mb-4">Tambah Modal</h3>
               <form onSubmit={handleCapitalInjection} className="space-y-4">
                  <select name="destId" defaultValue={selectedAccountId || ""} className="w-full p-2 border rounded-xl"><option value="">Ke Akun...</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
                  <input name="amount" placeholder="Nominal" onChange={(e) => e.target.value = formatCurrencyInput(e.target.value)} className="w-full p-2 border rounded-xl" />
                  <input name="description" placeholder="Sumber Dana" className="w-full p-2 border rounded-xl" />
                  <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded-xl">Tambah</button>
               </form>
             </div>
           </div>
        )}

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'cash_account' && renderCashAccount()}
        {activeTab === 'reports' && <div className="text-center p-8 text-slate-500">Laporan (Segera Hadir)</div>}
      </main>

      {isMenuOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsMenuOpen(false)} />}
      <div className={`fixed bottom-24 right-6 z-50 transition-all ${isMenuOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}>
        <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[2.5rem] p-4 w-72 ring-1 ring-black/5">
            <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
              { id: 'history', label: 'Riwayat Transaksi', icon: <History size={20} /> },
              { id: 'cash_account', label: 'Akun Kas', icon: <Wallet size={20} /> },
              { id: 'reports', label: 'Laporan', icon: <FileText size={20} /> },
            ].map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-bri-blue text-white shadow-lg' : 'text-slate-600 hover:bg-white'}`}>{item.icon}<span className="text-sm">{item.label}</span></button>
            ))}
            </nav>
        </div>
      </div>
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-xl flex items-center justify-center text-white transition-all transform hover:scale-105 ${isMenuOpen ? 'bg-slate-800 rotate-90' : 'bg-bri-blue'}`}>{isMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
    </div>
  );
};

export default App;