"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      const { data, error } = await supabase
        .from("resume_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setHistory(data || []);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const scoreColor = (score: number) =>
    score >= 80 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400";

  const scoreRing = (score: number) =>
    score >= 80 ? "border-green-400" : score >= 50 ? "border-yellow-400" : "border-red-400";

  return (
    <main className="min-h-screen bg-[#0f1117] text-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">AI</div>
          <h1 className="text-lg font-semibold tracking-tight">Resume Analyzer</h1>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-xs text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          ← Back to Analyzer
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-2">Analysis History</h2>
        <p className="text-sm text-gray-400 mb-8">Your past resume analyses</p>

        {loading && (
          <div className="text-gray-400 text-sm">Loading history...</div>
        )}

        {!loading && history.length === 0 && (
          <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-gray-400 text-sm">No analyses yet. Go analyze your first resume!</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              Start Analyzing
            </button>
          </div>
        )}

        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="bg-[#1a1d27] border border-gray-700 rounded-2xl p-6">
              {/* Row Summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full border-4 ${scoreRing(item.ats_score)} flex items-center justify-center shrink-0`}>
                    <span className={`text-lg font-bold ${scoreColor(item.ats_score)}`}>{item.ats_score}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.file_name || "Untitled Resume"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(item.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  className="text-xs text-blue-400 hover:text-blue-300 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {expanded === item.id ? "Hide Details" : "View Details"}
                </button>
              </div>

              {/* Expanded Details */}
              {expanded === item.id && (
                <div className="mt-5 space-y-4 border-t border-gray-700 pt-5">
                  {/* Keywords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">✅ Matched Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.matched_keywords?.map((kw: string) => (
                          <span key={kw} className="bg-green-900/50 text-green-300 border border-green-700 px-2 py-0.5 rounded-full text-xs">{kw}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">❌ Missing Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.missing_keywords?.map((kw: string) => (
                          <span key={kw} className="bg-red-900/50 text-red-300 border border-red-700 px-2 py-0.5 rounded-full text-xs">{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section Feedback */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">📋 Section Feedback</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(item.section_feedback || {}).map(([section, feedback]) => (
                        <div key={section} className="bg-[#0f1117] border border-gray-700 rounded-xl p-3">
                          <p className="text-xs font-semibold text-blue-400 uppercase mb-1">{section}</p>
                          <p className="text-xs text-gray-300">{feedback as string}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}