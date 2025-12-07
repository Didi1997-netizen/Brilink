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

// Logic Grouping
const INBOUND_TRANSACTIONS = [
  TransactionType.TARIK_TUNAI_BANK,
  TransactionType.TARIK_EWALLET,
  TransactionType.TARIK_KJP
];

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

  // Derived Selected Account (Agar selalu realtime saat balance berubah)
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
    { label: 'Paket Data', type: TransactionType.DATA, icon: <Signal size={24} />, color: 'bg-gradient-to-br from-cyan-500 to-blue-500',