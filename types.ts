import React from 'react';

export enum TransactionType {
  // Layanan Perbankan
  TRANSFER_BANK = 'Transfer Bank',
  TARIK_TUNAI_BANK = 'Tarik Tunai Bank',
  
  // E-Wallet
  TOPUP_EWALLET = 'Top-up E-wallet',
  TARIK_EWALLET = 'Tarik Saldo E-wallet',
  
  // Pembayaran & Kartu
  BRIVA = 'Pembayaran VA / BRIVA',
  TOPUP_EMONEY = 'Top-up Kartu Elektronik',
  
  // Layanan Khusus
  TARIK_KJP = 'Tarik Tunai KJP',
  EDC_RENTAL = 'Layanan Sewa EDC',
  
  // PPOB Umum
  PLN_TOKEN = 'Token Listrik',
  PLN_BILL = 'Tagihan Listrik',
  PULSA = 'Pulsa Seluler',
  DATA = 'Paket Data',
  PDAM = 'PDAM',
  BPJS = 'BPJS Kesehatan',
}

export enum TransactionStatus {
  SUCCESS = 'Berhasil',
  PENDING = 'Proses',
  FAILED = 'Gagal',
}

export enum PaymentMethod {
  TUNAI = 'Tunai',
  TRANSFER = 'Transfer',
  SPLIT = 'Split Bill (Tunai + Transfer)'
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  customerName: string;
  accountNumber?: string; 
  provider?: string;
  amount: number; // Nominal Asli
  adminFee: number; // Biaya Admin Bank (New)
  agentFee: number; // Keuntungan agen
  total: number; // Total yang dibayar customer
  status: TransactionStatus;
  
  // Audit Trail Mutasi Ganda
  sourceAccountId?: string; // Akun yang dipakai kirim uang
  paymentMethod?: PaymentMethod;
  paymentReceiverId?: string; // Akun yang terima uang (jika transfer/split)
  
  // For split data passing from form (temporary/loose type)
  splitCashAmount?: string;
  splitTransferAmount?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// --- NEW CASH ACCOUNT TYPES ---

export enum AccountType {
  TUNAI = 'Tunai',
  DIGITAL = 'Digital (Bank/E-Wallet)',
  PPOB = 'Saldo PPOB',
  MERCHANT = 'Merchant (EDC/QRIS)',
}

export interface CashAccount {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  minimumBalance?: number; 
  accountNumber?: string;
  mdrPercent?: number; 
  settlementAccountId?: string;
}

export interface CashMutation {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'SETTLEMENT' | 'CAPITAL_IN';
  sourceAccountId?: string;
  destinationAccountId?: string;
  fee?: number; 
}

// --- STATIC DATA LISTS ---

export const BANK_GROUPS = {
  BUMN: ['Bank BRI', 'Bank Mandiri', 'Bank BNI', 'Bank BTN'],
  SWASTA: ['Bank BCA', 'CIMB Niaga', 'Bank Danamon', 'Bank Permata', 'Bank Panin', 'Maybank', 'OCBC NISP', 'Bank Mega'],
  DIGITAL: ['Bank Jago', 'Allo Bank', 'Seabank', 'Blu by BCA', 'Bank Neo Commerce', 'Hibank'],
  BPD: ['Bank DKI', 'Bank BJB', 'Bank Jateng', 'Bank Jatim', 'BPD DIY', 'Bank Nagari', 'Bank Sumut', 'Bank Aceh'],
  SYARIAH: ['BSI (Syariah Indonesia)', 'Bank Muamalat', 'Bank Mega Syariah', 'Panin Dubai Syariah']
};

export const EWALLET_LIST = [
  'GoPay (Customer)', 'GoPay (Driver)', 'OVO', 'DANA', 'LinkAja', 'ShopeePay', 'iSaku'
];

export const EMONEY_LIST = [
  'BRIZZI', 'Mandiri E-money', 'BCA Flazz', 'BNI TapCash', 'JakCard'
];