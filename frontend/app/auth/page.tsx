"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    setLoading(true);
    setError("");

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) setError(error.message);
    else router.push("/");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0f1117] text-white flex items-center justify-center">
      <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">AI</div>
          <h1 className="text-lg font-semibold">Resume Analyzer</h1>
        </div>

        <h2 className="text-xl font-bold mb-6">{isLogin ? "Welcome back" : "Create account"}</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#0f1117] border border-gray-600 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[#0f1117] border border-gray-600 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-blue-500"
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:underline">
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </main>
  );
}