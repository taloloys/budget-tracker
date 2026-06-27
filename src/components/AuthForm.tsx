"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // Quick state to show logged in status

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg("Successfully signed in!");
        setUser(data.user);
        // Normally, you would redirect here, e.g., using useRouter() from next/navigation
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg(
          "Registration successful! You can now sign in (or check your email for confirmation)."
        );
        setIsLogin(true); // Switch to login after successful signup
      }
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSuccessMsg("Signed out successfully.");
  };

  if (user) {
    return (
      <div className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none" />
        <div className="relative flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
          <p className="text-zinc-300">You are securely signed in as <span className="font-semibold text-white">{user.email}</span>.</p>
          <button
            onClick={handleSignOut}
            className="w-full mt-6 py-3 px-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-medium transition-all duration-300 ease-in-out"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden group">
      {/* Decorative gradient background */}
      <div className="absolute -inset-10 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none" />
      
      <div className="relative">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-zinc-400 text-sm">
            {isLogin
              ? "Enter your credentials to access your account."
              : "Sign up to start managing your budget securely."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-black/60 transition-all duration-300 outline-none"
                placeholder="Email address"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-black/60 transition-all duration-300 outline-none"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-sm text-emerald-400 text-center">{successMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group/btn relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/20 hover:shadow-lg hover:shadow-indigo-500/20 overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-80 group-hover/btn:opacity-100 transition-opacity duration-300 -z-10" />
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                {isLogin ? "Sign In" : "Sign Up"}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSuccessMsg(null);
            }}
            className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
