"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Category {
  id: string;
  name: string;
}

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface TransactionModalProps {
  userId: string;
  categories: Category[];
  accounts: Account[];
  activeSpaceId: string;
  onTransactionAdded: () => void;
}

export function TransactionModal({ userId, categories, accounts, activeSpaceId, onTransactionAdded }: TransactionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !accountId) return;

    setLoading(true);
    
    // Insert new transaction
    const { error: insertError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        amount: parseFloat(amount),
        description,
        category_id: categoryId,
        account_id: accountId,
        space_id: activeSpaceId,
        transaction_date: new Date().toISOString().split('T')[0],
      });

    if (insertError) {
      console.error("Error adding transaction:", insertError);
      alert("Failed to add transaction. Please try again.");
      setLoading(false);
      return;
    }

    // Optional: Update account balance
    // This could also be handled by a PostgreSQL trigger for better consistency
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      // Assuming expenses are positive numbers in the form, subtract from balance
      // If income, it would be a negative expense, or handled differently. Assuming expense-only for now based on context.
      const newBalance = Number(account.balance) - parseFloat(amount);
      await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", accountId);
    }

    setAmount("");
    setDescription("");
    setCategoryId("");
    setAccountId("");
    setIsOpen(false);
    setLoading(false);
    onTransactionAdded(); // Refresh data in parent
  };

  return (
    <>
      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
      >
        <Plus className="w-5 h-5" />
        Log Expense
      </button>

      {/* Modal / Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <div className="relative w-full sm:max-w-md bg-zinc-900 rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/10 p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Log Transaction</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:text-white bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g., Groceries at Trader Joe's"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    <option value="" disabled>Select</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Account</label>
                  <select
                    required
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    <option value="" disabled>Select</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex justify-center items-center py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
