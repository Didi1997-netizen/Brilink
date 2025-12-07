import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Transaction, TransactionStatus } from '../../types';

interface HistoryViewProps {
  transactions: Transaction[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-800">Riwayat Transaksi</h2>
        <div className="flex gap-2">
           <div className="relative">
             <input type="text" placeholder="Cari..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bri-blue w-full md:w-64"/>
             <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
           </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 font-medium">ID & Waktu</th>
              <th className="px-6 py-3 font-medium">Jenis</th>
              <th className="px-6 py-3 font-medium">Pelanggan</th>
              <th className="px-6 py-3 font-medium">Nominal</th>
              <th className="px-6 py-3 font-medium text-right">Fee Agen</th>
              <th className="px-6 py-3 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((trx) => (
              <tr key={trx.id} className="bg-white border-b border-slate-50 hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{trx.id}</div>
                  <div className="text-slate-500 text-xs">{trx.date}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {trx.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="font-medium">{trx.customerName}</div>
                  {trx.accountNumber && <div className="text-xs text-slate-400">{trx.accountNumber}</div>}
                </td>
                <td className="px-6 py-4 font-mono font-medium text-slate-700">Rp {trx.amount.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 font-mono text-green-600 text-right">+Rp {trx.agentFee.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                     trx.status === TransactionStatus.SUCCESS ? 'text-green-600 bg-green-50' :
                     trx.status === TransactionStatus.PENDING ? 'text-orange-600 bg-orange-50' :
                     'text-red-600 bg-red-50'
                   }`}>
                     {trx.status}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};