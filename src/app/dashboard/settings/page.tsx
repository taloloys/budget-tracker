"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, ArrowLeft, User, Wallet, Tags, Plus, Save, X, Edit } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  monthly_budget_limit: number;
}

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface Space {
  id: string;
  name: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState<any>(null);
  
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const supabase = createClient();

  // 1. Fetch User and Spaces
  const fetchSessionAndSpaces = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        window.location.href = "/";
        return;
      }
      setUserSession(session.user);

      const { data: spacesData } = await supabase
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
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 2. Fetch Data for Active Space
  const fetchSpaceData = useCallback(async () => {
    if (!activeSpaceId) return;

    try {
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
        .eq("space_id", activeSpaceId)
        .order("name", { ascending: true });
      
      if (catData) setCategories(catData);
      else setCategories([]);
      
    } catch (error) {
      console.error("Error fetching space data:", error);
    }
  }, [activeSpaceId, supabase]);

  useEffect(() => {
    fetchSessionAndSpaces();
  }, [fetchSessionAndSpaces]);

  useEffect(() => {
    fetchSpaceData();
  }, [fetchSpaceData]);

  // Format currency
  const formatPHP = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  // --- Handlers for Category Management ---
  const [newCatName, setNewCatName] = useState("");
  const [newCatLimit, setNewCatLimit] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatLimit, setEditCatLimit] = useState("");

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSpaceId || !newCatName || !newCatLimit) return;
    setAddingCat(true);
    const { error } = await supabase.from("categories").insert({
      space_id: activeSpaceId,
      name: newCatName,
      monthly_budget_limit: Number(newCatLimit)
    });
    if (!error) {
      setNewCatName("");
      setNewCatLimit("");
      fetchSpaceData();
    }
    setAddingCat(false);
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCatLimit) return;
    const { error } = await supabase
      .from("categories")
      .update({ monthly_budget_limit: Number(editCatLimit) })
      .eq("id", id);
    if (!error) {
      setEditingCatId(null);
      fetchSpaceData();
    }
  };

  // --- Handlers for Account Management ---
  const [newAccName, setNewAccName] = useState("");
  const [newAccBalance, setNewAccBalance] = useState("");
  const [addingAcc, setAddingAcc] = useState(false);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSpaceId || !newAccName || !newAccBalance) return;
    setAddingAcc(true);
    const { error } = await supabase.from("accounts").insert({
      space_id: activeSpaceId,
      name: newAccName,
      balance: Number(newAccBalance)
    });
    if (!error) {
      setNewAccName("");
      setNewAccBalance("");
      fetchSpaceData();
    }
    setAddingAcc(false);
  };

  if (loading) {
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
        <header className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Settings & Management
            </h1>
            <p className="text-zinc-500 text-sm">Manage your profile and budget configurations</p>
          </div>
        </header>

        {/* 1. User Profile Details Section */}
        <section className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Profile Details</h2>
              <div className="mt-2 space-y-1 text-sm">
                <p className="text-zinc-400">Email: <span className="text-zinc-200 font-medium">{userSession?.email}</span></p>
                <p className="text-zinc-400">User ID: <span className="text-zinc-500 text-xs font-mono">{userSession?.id}</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* Space Selector for Management Context */}
        {spaces.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-400 px-1">Managing Space:</h3>
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
          </div>
        )}

        {activeSpaceId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 2. Budget & Category Management */}
            <section className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                  <Tags className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-white">Categories</h2>
              </div>
              
              <div className="flex-1 space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {categories.map(cat => (
                  <div key={cat.id} className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between group">
                    <span className="text-sm font-medium text-zinc-300">{cat.name}</span>
                    
                    {editingCatId === cat.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          value={editCatLimit}
                          onChange={e => setEditCatLimit(e.target.value)}
                          className="w-24 px-2 py-1 bg-black text-sm text-white rounded border border-white/10 focus:outline-none"
                        />
                        <button onClick={() => handleUpdateCategory(cat.id)} className="text-emerald-400 hover:text-emerald-300 p-1">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingCatId(null)} className="text-zinc-500 hover:text-white p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white">{formatPHP(cat.monthly_budget_limit)}</span>
                        <button 
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setEditCatLimit(cat.monthly_budget_limit.toString());
                          }}
                          className="text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-white transition-all p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {categories.length === 0 && <p className="text-zinc-500 text-sm text-center py-4">No categories created yet.</p>}
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} className="mt-auto pt-4 border-t border-white/5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    placeholder="Category Name" 
                    required
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input 
                    type="number" 
                    placeholder="Limit (₱)" 
                    required
                    value={newCatLimit}
                    onChange={e => setNewCatLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={addingCat}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-white/5"
                >
                  {addingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Category
                </button>
              </form>
            </section>

            {/* 3. Account Management Module */}
            <section className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-white">Accounts</h2>
              </div>
              
              <div className="flex-1 space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {accounts.map(acc => (
                  <div key={acc.id} className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-300">{acc.name}</span>
                    <span className="text-sm font-bold text-white">{formatPHP(acc.balance)}</span>
                  </div>
                ))}
                {accounts.length === 0 && <p className="text-zinc-500 text-sm text-center py-4">No accounts linked.</p>}
              </div>

              {/* Add Account Form */}
              <form onSubmit={handleAddAccount} className="mt-auto pt-4 border-t border-white/5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    placeholder="Account Name" 
                    required
                    value={newAccName}
                    onChange={e => setNewAccName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input 
                    type="number" 
                    placeholder="Initial Bal (₱)" 
                    required
                    value={newAccBalance}
                    onChange={e => setNewAccBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={addingAcc}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-white/5"
                >
                  {addingAcc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Account
                </button>
              </form>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}
