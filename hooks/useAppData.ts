import { useState, useEffect } from 'react';
import { CashAccount, CashMutation, Transaction, TransactionType, TransactionStatus, AccountType } from '../types';

const INITIAL_ACCOUNTS: CashAccount[] = [
  { id: 'ACC-001', name: 'Kas Laci (Tunai)', type: AccountType.TUNAI, balance: 2500000, minimumBalance: 1000000 },
  { id: 'ACC-002', name: 'BRImo Ops', type: AccountType.DIGITAL, balance: 15000000, accountNumber: '1234-56-7890', minimumBalance: 5000000 },
  { id: 'ACC-003', name: 'myBCA', type: AccountType.DIGITAL, balance: 5000000, accountNumber: '8800112233', minimumBalance: 2000000 },
  { id: 'ACC-004', name: 'EDC BRI', type: AccountType.MERCHANT, balance: 2000000, mdrPercent: 0.5, settlementAccountId: 'ACC-002' },
];

const MOCK_HISTORY: Transaction[] = [
  { id: 'TRX-001', date: '2023-10-24 10:30', type: TransactionType.TRANSFER_BANK, customerName: 'Budi Santoso', accountNumber: '1234567890', amount: 500000, adminFee: 6500, agentFee: 5000, total: 511500, status: TransactionStatus.SUCCESS },
];

export function useAppData() {
  const [accounts, setAccounts] = useState<CashAccount[]>(INITIAL_ACCOUNTS);
  const [mutations, setMutations] = useState<CashMutation[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>(MOCK_HISTORY);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAccounts = localStorage.getItem('agenlink_accounts');
      if (savedAccounts) setAccounts(JSON.parse(savedAccounts));

      const savedMutations = localStorage.getItem('agenlink_mutations');
      if (savedMutations) setMutations(JSON.parse(savedMutations));

      const savedHistory = localStorage.getItem('agenlink_history');
      if (savedHistory) setTransactionHistory(JSON.parse(savedHistory));
      
      setIsLoaded(true);
    }
  }, []);

  // Persist to LocalStorage
  useEffect(() => { 
    if (isLoaded) localStorage.setItem('agenlink_accounts', JSON.stringify(accounts)); 
  }, [accounts, isLoaded]);
  
  useEffect(() => { 
    if (isLoaded) localStorage.setItem('agenlink_mutations', JSON.stringify(mutations)); 
  }, [mutations, isLoaded]);
  
  useEffect(() => { 
    if (isLoaded) localStorage.setItem('agenlink_history', JSON.stringify(transactionHistory)); 
  }, [transactionHistory, isLoaded]);

  return {
    accounts,
    setAccounts,
    mutations,
    setMutations,
    transactionHistory,
    setTransactionHistory,
    isLoaded
  };
}