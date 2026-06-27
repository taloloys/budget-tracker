"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AuthForm from "@/components/AuthForm";
import { Wallet, ShieldCheck, LineChart } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/dashboard");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        {/* Navigation */}
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              BudgetTracker
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col lg:flex-row items-center justify-between gap-16 py-12 lg:py-24">
          
          {/* Left Column: Hero Copy */}
          <div className="flex-1 text-center lg:text-left space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 font-medium">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Secure & Private
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Master your finances with <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                clarity
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Take complete control of your shared budget. Designed for partners who want an elegant, secure, and straightforward way to track expenses together.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 justify-center lg:justify-start">
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <LineChart className="w-5 h-5 text-purple-400" />
                <span>Real-time Analytics</span>
              </div>
            </div>
          </div>

          {/* Right Column: Auth Form */}
          <div className="w-full lg:w-auto flex justify-center z-10">
            <AuthForm />
          </div>

        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-sm text-zinc-600 border-t border-white/10 mt-auto z-10">
          <p>&copy; {new Date().getFullYear()} BudgetTracker. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
