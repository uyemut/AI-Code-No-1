import React, { useState, useEffect } from "react";
import { DecisionResult, AnalysisType } from "./types";
import HistorySidebar from "./components/HistorySidebar";
import DecisionForm from "./components/DecisionForm";
import ResultView from "./components/ResultView";
import { 
  GitCommit, 
  HelpCircle, 
  Scale, 
  Sparkles, 
  AlertTriangle, 
  X,
  MessageSquareShare,
  Check
} from "lucide-react";

export default function App() {
  const [history, setHistory] = useState<DecisionResult[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tiebreaker_history_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
          if (parsed.length > 0) {
            setActiveId(parsed[0].id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
    }
  }, []);

  // Save history on change
  const saveHistory = (newHistory: DecisionResult[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("tiebreaker_history_v1", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleFormSubmit = async (formData: {
    decisionTitle: string;
    analysisType: AnalysisType;
    options?: string[];
    additionalContext?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/decide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to retrieve analysis from The Tiebreaker.");
      }

      const newId = `dec-${Date.now()}`;
      const newDecision: DecisionResult = {
        id: newId,
        title: formData.decisionTitle,
        createdAt: new Date().toISOString(),
        type: formData.analysisType,
        additionalContext: formData.additionalContext,
        rawResponse: result.data,
      };

      const updatedHistory = [newDecision, ...history];
      saveHistory(updatedHistory);
      setActiveId(newId);
      showToast("Dilemma analyzed successfully! Tiebreaker verdict delivered.");
    } catch (err: any) {
      console.error("Error submitting decision:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockChoice = (choice: string, followedAI: boolean) => {
    const updatedHistory = history.map((item) => {
      if (item.id === activeId) {
        return {
          ...item,
          userFinalChoice: choice,
          followedAI,
        };
      }
      return item;
    });
    saveHistory(updatedHistory);
    showToast(`Decision locked in: "${choice}"`);
  };

  const handleShare = () => {
    const activeResult = history.find((h) => h.id === activeId);
    if (!activeResult) return;

    try {
      const formattedText = `The Tiebreaker Analysis: "${activeResult.title}"\nMethod: ${activeResult.type.toUpperCase()}\nVerdict:\n${activeResult.rawResponse.tiebreakerVerdict}`;
      navigator.clipboard.writeText(formattedText);
      showToast("Analysis summary copied to clipboard!");
    } catch (err) {
      showToast("Unable to copy to clipboard.");
    }
  };

  const handleDeleteDecision = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    saveHistory(updated);
    if (activeId === id) {
      setActiveId(updated.length > 0 ? updated[0].id : null);
    }
    showToast("Decision log removed.");
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to permanently clear your entire decision log? This cannot be undone.")) {
      saveHistory([]);
      setActiveId(null);
      showToast("Logged decisions successfully cleared.");
    }
  };

  const handleNewDecision = () => {
    setActiveId(null);
  };

  const activeResult = history.find((h) => h.id === activeId);

  return (
    <div className="min-h-screen bg-slate-50/30 flex flex-col font-sans" id="app-root">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in border border-slate-800" id="app-toast">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header navigation */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" id="header-content">
          <div className="flex items-center gap-3 cursor-pointer" id="header-brand" onClick={handleNewDecision}>
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white" id="brand-logo">
              <Scale className="w-5.5 h-5.5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-950 tracking-tight flex items-center gap-1.5 font-sans">
                <span>The Tiebreaker</span>
                <span className="text-[10px] text-amber-500 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full font-mono uppercase tracking-wider">Beta</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">Defensive Choice Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3" id="header-right">
            <button
              onClick={handleNewDecision}
              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              id="btn-new-dilemma-header"
            >
              New Dilemma
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6" id="app-workspace">
        {/* Left Sidebar logs */}
        <HistorySidebar
          history={history}
          activeId={activeId}
          onSelect={setActiveId}
          onDelete={handleDeleteDecision}
          onClearAll={handleClearAll}
          onNewDecision={handleNewDecision}
        />

        {/* Content Workspace */}
        <div className="flex-1 min-w-0" id="main-content-area">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3" id="error-banner">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs" id="error-details">
                <p className="font-bold text-rose-900 font-sans">Encountered an Error</p>
                <p className="text-rose-800 leading-relaxed mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-rose-600 p-1 rounded-lg"
                id="btn-close-error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Core dynamic content */}
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-sm font-sans" id="loading-state">
              <div className="relative mb-6" id="loader-animation">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 tracking-tight">The Tiebreaker is evaluating your dilemma...</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-normal">
                Applying weighted calculations, formulating criteria matrices, and drafting a decisive action plan to break your analysis paralysis.
              </p>
            </div>
          ) : activeId && activeResult ? (
            <ResultView
              result={activeResult}
              onLockChoice={handleLockChoice}
              onShare={handleShare}
            />
          ) : (
            <div className="space-y-6" id="welcome-form-container">
              {/* Introduction Banner card */}
              <div className="bg-slate-950 text-white rounded-2xl p-5 md:p-6 shadow-md border border-slate-800 relative overflow-hidden" id="intro-hero-banner">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at top right, white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                <div className="relative space-y-2.5 max-w-2xl font-sans" id="hero-content">
                  <h2 className="text-base md:text-lg font-bold text-amber-400 tracking-tight flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>Conquer Analysis Paralysis</span>
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                    Welcome to **The Tiebreaker**. When your decisions are too close to call, we structure your dilemma into rigorous comparative frameworks—whether classical weighted Pros & Cons, strategic SWOT analysis, or multi-option criteria matrix tables.
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Simply fill out your objective below, select an evaluation strategy, and let the advisor formulate a decisive direction.
                  </p>
                </div>
              </div>

              {/* Decision form component */}
              <DecisionForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>
          )}
        </div>
      </main>

      {/* Humble aesthetic footer */}
      <footer className="bg-white border-t border-slate-200/80 py-5 text-center text-[10px] text-slate-400 font-mono mt-12" id="app-footer">
        <p>© 2026 The Tiebreaker • Structured Decision Intelligence Engine</p>
      </footer>
    </div>
  );
}
