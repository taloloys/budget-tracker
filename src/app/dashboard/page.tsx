"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 flex flex-col items-center justify-center p-4">
      <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
      
      <div className="z-10 text-center max-w-md w-full bg-zinc-900 border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
          Dashboard
        </h1>
        <p className="text-zinc-400 text-sm">
          Welcome to your clean slate workspace. We will systematically re-implement the ledger features here.
        </p>
        
        <button 
          onClick={handleSignOut}
          className="w-full flex justify-center items-center gap-2 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-colors border border-white/5"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
