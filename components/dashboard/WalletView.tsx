import React from 'react';
import { WalletState } from '../../types';
import { IndianRupee, ArrowUpRight, ArrowDownLeft, Clock, Wallet } from 'lucide-react';

interface WalletViewProps {
  wallet: WalletState;
}

export const WalletView: React.FC<WalletViewProps> = ({ wallet }) => {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2 mb-2">
         <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
            <Wallet size={24} />
         </div>
         <h2 className="text-xl font-bold text-gray-900">My Wallet</h2>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl"></div>
        <p className="text-gray-400 text-sm font-medium mb-1">Total Balance</p>
        <div className="flex items-baseline gap-1">
          <IndianRupee size={32} className="text-white" />
          <span className="text-4xl font-bold tracking-tight">{wallet.balance.toLocaleString('en-IN')}</span>
        </div>
        <div className="mt-6 flex gap-4">
           <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <div className="bg-green-500/20 p-1 rounded text-green-400">
                <ArrowDownLeft size={14} />
              </div>
              <span className="text-xs font-medium text-green-100">Credits</span>
           </div>
           <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <div className="bg-red-500/20 p-1 rounded text-red-400">
                <ArrowUpRight size={14} />
              </div>
              <span className="text-xs font-medium text-red-100">Debits</span>
           </div>
        </div>
      </div>

      {/* History */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-gray-400"/> Transaction History
        </h3>
        
        {wallet.transactions.length === 0 ? (
             <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No transactions yet.
             </div>
        ) : (
            <div className="space-y-3">
            {wallet.transactions.map((txn) => (
                <div key={txn.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {txn.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{txn.description}</p>
                            <p className="text-xs text-gray-500 capitalize">{txn.date} • {txn.category} • <span className={txn.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>{txn.status}</span></p>
                        </div>
                    </div>
                    <div className={`text-right font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};