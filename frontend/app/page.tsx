"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState<any>(null);
  const [rewritten, setRewritten] = useState("");
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<any>(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/auth");
      else setUser(data.user);
    });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setResumeText(data.extracted_text);
  };

  const handleAnalyze = async () => {
    if (!resumeText || !jobDesc) return;
    setLoading(true);
    setResult(null);
    setRewritten("");
    setQuestions(null);

    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_text: resumeText, job_description: jobDesc }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);

    await supabase.from("resume_history").insert({
      user_id: user.id,
      file_name: fileName,
      ats_score: data.ats_score,
      matched_keywords: data.matched_keywords,
      missing_keywords: data.missing_keywords,
      section_feedback: data.section_feedback,
    });
  };

  const handleRewrite = async () => {
    if (!resumeText || !result?.missing_keywords) return;
    setRewriting(true);

    const res = await fetch("http://localhost:8000/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_text: resumeText,
        missing_keywords: result.missing_keywords,
      }),
    });

    const data = await res.json();
    setRewritten(data.rewritten_resume);
    setRewriting(false);
  };

  const handleInterviewQuestions = async () => {
    if (!resumeText || !jobDesc) return;
    setLoadingQ(true);

    const res = await fetch("http://localhost:8000/interview-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_text: resumeText, job_description: jobDesc }),
    });

    const data = await res.json();
    setQuestions(data);
    setLoadingQ(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rewritten);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor =
    result?.ats_score >= 80
      ? "text-green-400"
      : result?.ats_score >= 50
      ? "text-yellow-400"
      : "text-red-400";

  const scoreRing =
    result?.ats_score >= 80
      ? "border-green-400"
      : result?.ats_score >= 50
      ? "border-yellow-400"
      : "border-red-400";

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#0f1117] text-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">
            AI
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Resume Analyzer</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">{user?.email}</span>
          <button
            onClick={() => router.push("/history")}
            className="text-xs text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            📋 History
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/auth");
            }}
            className="text-xs text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Upload Resume */}
          <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Upload Resume
            </h2>
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
              <span className="text-3xl mb-2">📄</span>
              <span className="text-sm text-gray-400">
                {fileName ? fileName : "Click to upload PDF"}
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            {resumeText && (
              <p className="mt-3 text-xs text-green-400 flex items-center gap-1">
                ✅ Resume parsed successfully
              </p>
            )}
          </div>

          {/* Job Description */}
          <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Job Description
            </h2>
            <textarea
              className="w-full h-36 bg-[#0f1117] border border-gray-600 rounded-xl p-3 text-sm text-gray-300 resize-none focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Paste the job description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
          </div>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center mb-10">
          <button
            onClick={handleAnalyze}
            disabled={!resumeText || !jobDesc || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed px-10 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Analyzing...
              </span>
            ) : (
              "Analyze Resume"
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* ATS Score */}
            <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl p-6 flex items-center gap-6">
              <div className={`w-24 h-24 rounded-full border-4 ${scoreRing} flex items-center justify-center shrink-0`}>
                <span className={`text-2xl font-bold ${scoreColor}`}>
                  {result.ats_score}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-1">ATS Score</h2>
                <p className="text-sm text-gray-400">
                  {result.ats_score >= 80
                    ? "Great match! Your resume aligns well with the job."
                    : result.ats_score >= 50
                    ? "Decent match. A few improvements can boost your chances."
                    : "Low match. Consider tailoring your resume more closely to the JD."}
                </p>
              </div>
            </div>

            {/* Keywords Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  ✅ Matched Keywords
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.matched_keywords?.map((kw: string) => (
                    <span key={kw} className="bg-green-900/50 text-green-300 border border-green-700 px-3 py-1 rounded-full text-xs">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  ❌ Missing Keywords
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords?.map((kw: string) => (
                    <span key={kw} className="bg-red-900/50 text-red-300 border border-red-700 px-3 py-1 rounded-full text-xs">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Section Feedback */}
            <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                📋 Section Feedback
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(result.section_feedback || {}).map(([section, feedback]) => (
                  <div key={section} className="bg-[#0f1117] border border-gray-700 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-400 uppercase mb-1">{section}</p>
                    <p className="text-sm text-gray-300">{feedback as string}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewriter */}
            <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                🔄 AI Resume Rewriter
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Automatically rewrites your resume with missing keywords and stronger bullet points.
              </p>
              <button
                onClick={handleRewrite}
                disabled={rewriting}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 px-6 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                {rewriting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Rewriting...
                  </span>
                ) : (
                  "✨ Rewrite My Resume"
                )}
              </button>

              {rewritten && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-400">Rewritten Resume</p>
                    <button onClick={handleCopy} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      {copied ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="bg-[#0f1117] border border-gray-700 rounded-xl p-4 whitespace-pre-wrap text-sm text-gray-300 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {rewritten}
                  </div>
                </div>
              )}
            </div>

            {/* Interview Questions */}
            <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                🎤 Interview Prep
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                AI-generated interview questions based on your resume and the job description.
              </p>
              <button
                onClick={handleInterviewQuestions}
                disabled={loadingQ}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 px-6 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                {loadingQ ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Generating...
                  </span>
                ) : (
                  "🎤 Generate Interview Questions"
                )}
              </button>

              {questions && (
                <div className="mt-5 space-y-5">
                  {[
                    { key: "technical", label: "🛠 Technical Questions", color: "text-blue-400" },
                    { key: "behavioral", label: "🧠 Behavioral Questions", color: "text-purple-400" },
                    { key: "resume_based", label: "📄 Resume-Based Questions", color: "text-yellow-400" },
                  ].map(({ key, label, color }) => (
                    <div key={key}>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${color}`}>
                        {label}
                      </p>
                      <ul className="space-y-2">
                        {questions[key]?.map((q: string, i: number) => (
                          <li key={i} className="bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-300">
                            {i + 1}. {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}