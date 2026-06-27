"use client";

import { Wallet, CreditCard, PiggyBank, ArrowDownRight, ArrowUpRight } from "lucide-react";

export interface Account {
  id: string;
  name: string;
  balance: number;
}

interface SummaryBannerProps {
  totalMonthlySpending: number;
  totalMonthlyBudget: number;
  accounts: Account[];
}

export function SummaryBanner({ totalMonthlySpending, totalMonthlyBudget, accounts }: SummaryBannerProps) {
  const remainingBudget = totalMonthlyBudget - totalMonthlySpending;
  const budgetPercentage = totalMonthlyBudget > 0 ? (totalMonthlySpending / totalMonthlyBudget) * 100 : 0;
  
  // Choose icon based on account name roughly
  const getAccountIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("card")) return <CreditCard className="w-5 h-5 text-purple-400" />;
    if (lower.includes("save") || lower.includes("savings")) return <PiggyBank className="w-5 h-5 text-emerald-400" />;
    return <Wallet className="w-5 h-5 text-indigo-400" />;
  };

  return (
    <div className="space-y-4 w-full">
      {/* Main Budget Card */}
      <div className="p-6 bg-zinc-900 rounded-3xl border border-white/5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-2">
          <span className="text-zinc-400 text-sm font-medium">Combined Remaining Budget</span>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-bold tracking-tight text-white">
              {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(remainingBudget)}
            </h2>
            <span className="text-zinc-500 text-sm mb-1">/ {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalMonthlyBudget)}</span>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex justify-between text-xs text-zinc-400 font-medium">
              <span>Spent: {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalMonthlySpending)}</span>
              <span>{Math.min(budgetPercentage, 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${budgetPercentage > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {accounts.map(account => (
          <div key={account.id} className="min-w-[140px] flex-1 p-4 bg-zinc-900/80 rounded-2xl border border-white/5 snap-start">
            <div className="flex flex-col gap-2">
              <div className="p-2 bg-black/40 rounded-lg w-fit">
                {getAccountIcon(account.name)}
              </div>
              <span className="text-zinc-400 text-xs font-medium truncate">{account.name}</span>
              <span className="text-white font-semibold text-lg">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(account.balance))}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
