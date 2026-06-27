"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { SummaryBanner, Account } from "./SummaryBanner";
import { TransactionModal } from "./TransactionModal";
import { ActivityFeed, Transaction } from "./ActivityFeed";
import { Loader2, LogOut } from "lucide-react";

interface Category {
  id: string;
  name: string;
  monthly_budget_limit: number;
}

interface Space {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  const supabase = createClient();

  // 1. First fetch session and spaces
  const fetchSessionAndSpaces = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        window.location.href = "/";
        return;
      }
      setUserId(session.user.id);

      // Fetch Spaces for the user
      const { data: spacesData, error: spacesError } = await supabase
        .from("space_members")
        .select(`
          space_id,
          budget_spaces ( id, name )
        `)
        .eq("user_id", session.user.id);
        
      if (spacesData && spacesData.length > 0) {
        // Map data depending on how Supabase returns joined rows (it usually returns an object or array)
        const fetchedSpaces = spacesData
          .map((s: any) => Array.isArray(s.budget_spaces) ? s.budget_spaces[0] : s.budget_spaces)
          .filter(Boolean) as Space[];
          
        setSpaces(fetchedSpaces);
        if (fetchedSpaces.length > 0) {
          setActiveSpaceId(fetchedSpaces[0].id);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching spaces:", error);
      setLoading(false);
    }
  }, [supabase]);

  // 2. Fetch space-specific data when activeSpaceId changes
  const fetchSpaceData = useCallback(async () => {
    if (!activeSpaceId) return;

    try {
      setLoading(true);

      // Fetch Accounts
      const { data: accData } = await supabase
        .from("accounts")
        .select("id, name, balance")
        .eq("space_id", activeSpaceId)
        .order("created_at", { ascending: true });
      
      if (accData) setAccounts(accData);
      else setAccounts([]);

      // Fetch Categories
      const { data: catData } = await supabase
        .from("categories")
        .select("id, name, monthly_budget_limit")
        .eq("space_id", activeSpaceId);
      
      if (catData) {
        setCategories(catData);
        const budgetSum = catData.reduce((acc, cat) => acc + Number(cat.monthly_budget_limit), 0);
        setTotalBudget(budgetSum);
      } else {
        setCategories([]);
        setTotalBudget(0);
      }

      // Fetch Recent Transactions
      const { data: txData } = await supabase
        .from("transactions")
        .select(`
          id, amount, description, transaction_date, created_at, user_id,
          categories ( name )
        `)
        .eq("space_id", activeSpaceId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (txData) {
        setTransactions(txData as unknown as Transaction[]);
      } else {
        setTransactions([]);
      }

      // Calculate Total Spent this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data: monthlyTxData } = await supabase
        .from("transactions")
        .select("amount")
        .eq("space_id", activeSpaceId)
        .gte("transaction_date", startOfMonth);

      if (monthlyTxData) {
        const spentSum = monthlyTxData.reduce((acc, tx) => acc + Number(tx.amount), 0);
        setTotalSpent(spentSum);
      } else {
        setTotalSpent(0);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [activeSpaceId, supabase]);

  useEffect(() => {
    fetchSessionAndSpaces();
  }, [fetchSessionAndSpaces]);

  useEffect(() => {
    fetchSpaceData();
  }, [fetchSpaceData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading && !activeSpaceId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24 lg:pb-12 selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Dashboard
            </h1>
            <p className="text-zinc-500 text-sm">Your financial overview</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 rounded-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Space Selector Dropdown / Tabs */}
        {spaces.length > 0 && (
          <div className="flex gap-2 p-1 bg-zinc-900 border border-white/5 rounded-2xl w-fit overflow-x-auto max-w-full">
            {spaces.map(space => (
              <button
                key={space.id}
                onClick={() => setActiveSpaceId(space.id)}
                className={`px-4 py-2 flex-shrink-0 rounded-xl text-sm font-medium transition-colors ${
                  activeSpaceId === space.id 
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {space.name}
              </button>
            ))}
          </div>
        )}

        {loading && activeSpaceId ? (
           <div className="py-12 flex items-center justify-center">
             <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
           </div>
        ) : (
          <>
            {/* Top Banner (Monthly Summary & Accounts) */}
            <SummaryBanner 
              totalMonthlySpending={totalSpent} 
              totalMonthlyBudget={totalBudget} 
              accounts={accounts} 
            />

            {/* Activity Feed */}
            <ActivityFeed transactions={transactions} currentUserId={userId} />

            {/* Mobile FAB / Desktop Button */}
            {userId && activeSpaceId && (
              <TransactionModal 
                userId={userId} 
                activeSpaceId={activeSpaceId}
                categories={categories} 
                accounts={accounts} 
                onTransactionAdded={fetchSpaceData} 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
