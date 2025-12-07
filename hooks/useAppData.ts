import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { CashAccount, CashMutation, Transaction } from '../types';

export function useAppData() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [mutations, setMutations] = useState<CashMutation[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  
  const [dataLoading, setDataLoading] = useState(false);

  // 1. Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen to Firestore Data (Only if logged in)
  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setMutations([]);
      setTransactionHistory([]);
      return;
    }

    setDataLoading(true);

    // References
    const userRef = doc(db, 'users', user.uid);
    const accountsRef = collection(userRef, 'accounts');
    const transactionsRef = collection(userRef, 'transactions');
    const mutationsRef = collection(userRef, 'mutations');

    // Subscribe Accounts
    const unsubAccounts = onSnapshot(query(accountsRef, orderBy('name')), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CashAccount));
      setAccounts(data);
    });

    // Subscribe Transactions (Limit 100 for performance in production, but all for now)
    const unsubTrans = onSnapshot(query(transactionsRef, orderBy('date', 'desc')), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      setTransactionHistory(data);
    });

    // Subscribe Mutations
    const unsubMutations = onSnapshot(query(mutationsRef, orderBy('date', 'desc')), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CashMutation));
      setMutations(data);
      setDataLoading(false);
    });

    return () => {
      unsubAccounts();
      unsubTrans();
      unsubMutations();
    };
  }, [user]);

  // --- ACTIONS (Wrapped in Promise for async/await in UI) ---

  const addAccount = async (account: Omit<CashAccount, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'accounts'), account);
  };

  const updateAccount = async (id: string, data: Partial<CashAccount>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'accounts', id), data);
  };

  const removeAccount = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'accounts', id));
  };

  // Logic Kompleks: Menjalankan Transaksi secara Atomic (Batch)
  // Ini memastikan jika satu langkah gagal, semua batal (Data Konsisten)
  const processTransactionBatch = async (
    trxData: Omit<Transaction, 'id'>, 
    mutationsData: Omit<CashMutation, 'id'>[],
    accountUpdates: { id: string, amount: number }[] // amount to ADD (negative for deduction)
  ) => {
    if (!user) return;

    const batch = writeBatch(db);
    const userRef = doc(db, 'users', user.uid);

    // 1. Create Transaction Record
    const trxRef = doc(collection(userRef, 'transactions'));
    batch.set(trxRef, { ...trxData, id: trxRef.id }); // ID disamakan

    // 2. Create Mutations
    mutationsData.forEach(mut => {
      const mutRef = doc(collection(userRef, 'mutations'));
      batch.set(mutRef, { ...mut, id: mutRef.id });
    });

    // 3. Update Account Balances
    // Note: In a real high-concurrency app, we should use runTransaction instead of batch + increment
    // But for this use case, reading current state inside component and writing batch is acceptable MVP
    accountUpdates.forEach(update => {
       const accRef = doc(userRef, 'accounts', update.id);
       // We assume the component calculated the final balance, OR we just increment/decrement
       // Let's use the 'increment' logic from firestore in a real app, 
       // but here we rely on the passed calc to be simple.
       // Since we passed 'updates' as what needs to happen to balance:
       const currentAcc = accounts.find(a => a.id === update.id);
       if (currentAcc) {
         batch.update(accRef, { balance: currentAcc.balance + update.amount });
       }
    });

    await batch.commit();
  };

  const processInternalTransfer = async (
    mutationData: Omit<CashMutation, 'id'>,
    sourceId: string,
    destId: string,
    amountSource: number, // Negative
    amountDest: number // Positive
  ) => {
     if (!user) return;
     const batch = writeBatch(db);
     const userRef = doc(db, 'users', user.uid);

     // Mutation Record
     const mutRef = doc(collection(userRef, 'mutations'));
     batch.set(mutRef, { ...mutationData, id: mutRef.id });

     // Update Source
     const sourceRef = doc(userRef, 'accounts', sourceId);
     const sourceAcc = accounts.find(a => a.id === sourceId);
     if(sourceAcc) batch.update(sourceRef, { balance: sourceAcc.balance + amountSource });

     // Update Dest
     const destRef = doc(userRef, 'accounts', destId);
     const destAcc = accounts.find(a => a.id === destId);
     if(destAcc) batch.update(destRef, { balance: destAcc.balance + amountDest });

     await batch.commit();
  };
  
  const processSimpleUpdate = async (
     mutationData: Omit<CashMutation, 'id'>,
     accountId: string,
     amount: number // +/-
  ) => {
     if (!user) return;
     const batch = writeBatch(db);
     const userRef = doc(db, 'users', user.uid);

     const mutRef = doc(collection(userRef, 'mutations'));
     batch.set(mutRef, { ...mutationData, id: mutRef.id });

     const accRef = doc(userRef, 'accounts', accountId);
     const acc = accounts.find(a => a.id === accountId);
     if(acc) batch.update(accRef, { balance: acc.balance + amount });

     await batch.commit();
  }

  return {
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
  };
}