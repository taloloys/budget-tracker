"use client";

import { ShoppingBag, Coffee, Home, Zap, Receipt } from "lucide-react";

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  transaction_date: string;
  created_at: string;
  user_id: string;
  categories?: {
    name: string;
  };
}

interface ActivityFeedProps {
  transactions: Transaction[];
  currentUserId: string | null;
}

export function ActivityFeed({ transactions, currentUserId }: ActivityFeedProps) {
  // Simple helper to pick an icon based on category name
  const getCategoryIcon = (categoryName?: string) => {
    const lower = categoryName?.toLowerCase() || "";
    if (lower.includes("grocer") || lower.includes("food")) return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
    if (lower.includes("coffee") || lower.includes("dine") || lower.includes("restaurant")) return <Coffee className="w-4 h-4 text-amber-400" />;
    if (lower.includes("rent") || lower.includes("home")) return <Home className="w-4 h-4 text-indigo-400" />;
    if (lower.includes("utilit")) return <Zap className="w-4 h-4 text-yellow-400" />;
    return <Receipt className="w-4 h-4 text-zinc-400" />;
  };

  const getUsername = (txUserId: string) => {
    if (txUserId === currentUserId) return "You";
    return "Partner";
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-end">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <span className="text-xs text-zinc-400 font-medium cursor-pointer hover:text-white transition-colors">View All</span>
      </div>

      <div className="bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            No transactions found. Log your first expense!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5">
                    {getCategoryIcon(tx.categories?.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-[150px] sm:max-w-[200px]">
                      {tx.description || tx.categories?.name || "Expense"}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <span className="truncate max-w-[80px]">{getUsername(tx.user_id)}</span>
                      <span>•</span>
                      <span>{new Date(tx.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    -{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(tx.amount))}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {tx.categories?.name || "Uncategorized"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
