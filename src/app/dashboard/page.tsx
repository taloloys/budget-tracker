"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { SummaryBanner, Account } from "./SummaryBanner";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { ActivityFeed, Transaction } from "./ActivityFeed";
import { Loader2, LogOut, Settings } from "lucide-react";
import Link from "next/link";

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

  // Onboarding Form State
  const [newSpaceName, setNewSpaceName] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [creatingSpace, setCreatingSpace] = useState(false);

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

      const { data: accData } = await supabase
        .from("accounts")
        .select("id, name, balance")
        .eq("space_id", activeSpaceId)
        .order("created_at", { ascending: true });
      
      if (accData) setAccounts(accData);
      else setAccounts([]);

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

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim() || !userId) return;

    setCreatingSpace(true);
    try {
      const { data: newSpaces, error: insertError } = await supabase
        .from("budget_spaces")
        .insert([{ name: newSpaceName, is_shared: isShared }])
        .select();

      if (insertError) throw insertError;

      if (newSpaces && newSpaces.length > 0) {
        const space = newSpaces[0];

        await supabase.from("space_members").insert({
          space_id: space.id,
          user_id: userId
        });

        setSpaces([space]);
        setActiveSpaceId(space.id);
      }
    } catch (error) {
      console.error("Error creating space:", error);
      alert("Failed to create space. Please try again.");
    } finally {
      setCreatingSpace(false);
    }
  };

  if (loading && !activeSpaceId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // --- Onboarding State View ---
  if (!loading && spaces.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col selection:bg-indigo-500/30">
        <header className="px-6 py-6 flex justify-between items-center border-b border-white/5">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            BudgetTracker
          </h1>
          <button onClick={handleSignOut} className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 rounded-full transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative z-10 text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-white">
                Welcome to your Budget Tracker!
              </h2>
              <p className="text-zinc-400 text-sm">
                Let's get started by creating your first tracking space.
              </p>
            </div>

            <form onSubmit={handleCreateSpace} className="relative z-10 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Space Name</label>
                <input
                  type="text"
                  required
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  placeholder="e.g., Klenth's Personal"
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <label className="flex items-center gap-3 p-4 bg-black/30 border border-white/5 rounded-xl cursor-pointer hover:bg-black/50 transition-colors">
                <input
                  type="checkbox"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-black bg-black"
                />
                <span className="text-sm font-medium text-zinc-300">
                  Is this a shared space with your partner?
                </span>
              </label>

              <button
                type="submit"
                disabled={creatingSpace}
                className="w-full flex justify-center items-center py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {creatingSpace ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Space"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Dashboard View ---
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
          <div className="flex items-center gap-2">
            <Link 
              href="/dashboard/settings"
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 rounded-full transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <button 
              onClick={handleSignOut}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 rounded-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
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
              <AddTransactionModal 
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
