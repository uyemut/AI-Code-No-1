import React from "react";
import { 
  AnalysisType, 
  ProsConsData, 
  ComparisonData, 
  SWOTData, 
  DecisionResult 
} from "../types";
import { 
  Scale, 
  Compass, 
  Grid, 
  CheckCircle, 
  XCircle, 
  Award, 
  ShieldCheck, 
  Share2, 
  ThumbsUp, 
  ArrowRight,
  Info
} from "lucide-react";

interface ResultViewProps {
  result: DecisionResult;
  onLockChoice: (choice: string, followedAI: boolean) => void;
  onShare: () => void;
}

export default function ResultView({ result, onLockChoice, onShare }: ResultViewProps) {
  const { title, type, rawResponse, userFinalChoice, followedAI } = result;

  // Render Pros & Cons list view
  const renderProsCons = () => {
    const data = rawResponse as ProsConsData;
    const pros = data.pros || [];
    const cons = data.cons || [];

    const totalProsWeight = pros.reduce((acc, p) => acc + p.weight, 0);
    const totalConsWeight = cons.reduce((acc, c) => acc + c.weight, 0);
    const balanceMax = Math.max(totalProsWeight + totalConsWeight, 1);
    const prosPercentage = Math.round((totalProsWeight / balanceMax) * 100);
    const consPercentage = Math.round((totalConsWeight / balanceMax) * 100);

    return (
      <div className="space-y-6" id="result-pros-cons-container">
        {/* Visual Balance Bar */}
        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl" id="pros-cons-balance-bar">
          <div className="flex justify-between items-center text-xs font-mono mb-2" id="bar-labels">
            <span className="text-emerald-700 font-bold">Pros Weight ({totalProsWeight})</span>
            <span className="text-rose-700 font-bold">Cons Weight ({totalConsWeight})</span>
          </div>
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex" id="bar-track">
            <div 
              style={{ width: `${prosPercentage}%` }} 
              className="bg-emerald-500 h-full transition-all duration-500"
              id="bar-pros"
            />
            <div 
              style={{ width: `${consPercentage}%` }} 
              className="bg-rose-500 h-full transition-all duration-500"
              id="bar-cons"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            {totalProsWeight > totalConsWeight 
              ? `Pros outweigh Cons by ${totalProsWeight - totalConsWeight} points.` 
              : totalConsWeight > totalProsWeight 
                ? `Cons outweigh Pros by ${totalConsWeight - totalProsWeight} points.`
                : "Pros and Cons are perfectly balanced in weight."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="pros-cons-split-grid">
          {/* Pros list */}
          <div className="space-y-3" id="pros-column">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5" id="pros-title">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Pros & Advantages</span>
            </h4>
            <div className="space-y-2.5" id="pros-list">
              {pros.map((pro, idx) => (
                <div key={idx} className="bg-emerald-50/40 border border-emerald-100/80 p-3 rounded-xl hover:bg-emerald-50/60 transition-colors" id={`pro-item-${idx}`}>
                  <div className="flex justify-between items-start gap-2" id={`pro-header-${idx}`}>
                    <h5 className="text-xs font-bold text-emerald-950 font-sans">{pro.title}</h5>
                    <span className="inline-flex items-center rounded bg-emerald-100/60 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-800 shrink-0">
                      Impact +{pro.weight}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 mt-1 leading-relaxed">{pro.description}</p>
                </div>
              ))}
              {pros.length === 0 && (
                <p className="text-xs text-slate-400 italic">No positive factors identified.</p>
              )}
            </div>
          </div>

          {/* Cons list */}
          <div className="space-y-3" id="cons-column">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5" id="cons-title">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Cons & Drawbacks</span>
            </h4>
            <div className="space-y-2.5" id="cons-list">
              {cons.map((con, idx) => (
                <div key={idx} className="bg-rose-50/40 border border-rose-100/80 p-3 rounded-xl hover:bg-rose-50/60 transition-colors" id={`con-item-${idx}`}>
                  <div className="flex justify-between items-start gap-2" id={`con-header-${idx}`}>
                    <h5 className="text-xs font-bold text-rose-950 font-sans">{con.title}</h5>
                    <span className="inline-flex items-center rounded bg-rose-100/60 px-1.5 py-0.5 text-[9px] font-mono font-bold text-rose-800 shrink-0">
                      Risk -{con.weight}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-900/80 mt-1 leading-relaxed">{con.description}</p>
                </div>
              ))}
              {cons.length === 0 && (
                <p className="text-xs text-slate-400 italic">No negative factors identified.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Comparison Matrix table
  const renderComparisonTable = () => {
    const data = rawResponse as ComparisonData;
    const criteria = data.criteria || [];
    const options = data.options || [];

    // Calculate total scores for options to determine the winner
    const scoreTotals = options.map(option => {
      const sum = option.scores.reduce((acc, s) => acc + s.score, 0);
      return { name: option.name, total: sum };
    });

    const maxScore = Math.max(...scoreTotals.map(t => t.total), 1);

    return (
      <div className="space-y-6" id="result-comparison-container">
        {/* Desktop responsive table wrapper */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl" id="table-wrapper">
          <table className="w-full text-left border-collapse font-sans text-xs" id="comparison-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 font-semibold text-slate-500 w-1/4">Evaluation Criterion</th>
                {options.map((opt, idx) => (
                  <th key={idx} className="p-3 font-bold text-slate-800 text-center border-l border-slate-200/60">
                    {opt.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {criteria.map((crit, cIdx) => (
                <tr key={cIdx} className="hover:bg-slate-50/40 transition-colors" id={`criterion-row-${crit.id}`}>
                  <td className="p-3">
                    <p className="font-semibold text-slate-800">{crit.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{crit.description}</p>
                  </td>
                  {options.map((opt, oIdx) => {
                    const scoreObj = opt.scores.find(s => s.criterionId === crit.id);
                    const scoreVal = scoreObj ? scoreObj.score : 0;
                    const scoreNote = scoreObj ? scoreObj.note : "";

                    return (
                      <td key={oIdx} className="p-3 text-center border-l border-slate-200/60 max-w-[200px]" id={`cell-${crit.id}-${oIdx}`}>
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center justify-center font-bold font-mono text-xs w-6 h-6 rounded-full ${
                            scoreVal >= 4 
                              ? "bg-emerald-100 text-emerald-800" 
                              : scoreVal <= 2 
                                ? "bg-rose-100 text-rose-800" 
                                : "bg-blue-100 text-blue-800"
                          }`}>
                            {scoreVal}
                          </span>
                          {scoreNote && (
                            <span className="text-[10px] text-slate-500 text-center leading-normal block">
                              {scoreNote}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Score Totals Row */}
              <tr className="bg-slate-50/80 font-bold border-t border-slate-200" id="total-scores-row">
                <td className="p-3 text-slate-700">Cumulative Score Matrix</td>
                {options.map((opt, idx) => {
                  const total = scoreTotals.find(t => t.name === opt.name)?.total || 0;
                  const isWinner = total === maxScore;

                  return (
                    <td key={idx} className="p-3 text-center border-l border-slate-200/60" id={`total-col-${idx}`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-base font-bold font-mono ${isWinner ? "text-emerald-700" : "text-slate-700"}`}>
                          {total}
                        </span>
                        {isWinner && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800">
                            <Award className="w-2.5 h-2.5" /> High Score
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Informative Help Text */}
        <div className="flex items-start gap-2 text-slate-500 bg-slate-50 border border-slate-150 p-3 rounded-xl text-[11px]" id="comparison-help">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            Scores are rated from 1 (Poor/Risky) to 5 (Excellent/Highly Optimal) based on the criteria configured by AI. Use this breakdown to see which option ticks the most strategic boxes.
          </p>
        </div>
      </div>
    );
  };

  // Render SWOT four-quadrant board
  const renderSWOT = () => {
    const data = rawResponse as SWOTData;
    const strengths = data.strengths || [];
    const weaknesses = data.weaknesses || [];
    const opportunities = data.opportunities || [];
    const threats = data.threats || [];

    return (
      <div className="space-y-6" id="result-swot-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="swot-grid">
          {/* Strengths */}
          <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-2xl flex flex-col h-full hover:shadow-sm transition-shadow" id="swot-strengths">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-3" id="strengths-title">
              <span className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center font-mono text-xs font-black">S</span>
              <span>Strengths</span>
            </h4>
            <div className="space-y-2.5 flex-1" id="strengths-list">
              {strengths.map((item, idx) => (
                <div key={idx} className="bg-white/80 border border-emerald-50/60 p-2.5 rounded-xl" id={`strength-${idx}`}>
                  <p className="text-xs font-bold text-emerald-950">{item.title}</p>
                  <p className="text-[11px] text-emerald-900/80 mt-0.5 leading-normal">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="bg-rose-50/30 border border-rose-100 p-4 rounded-2xl flex flex-col h-full hover:shadow-sm transition-shadow" id="swot-weaknesses">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5 mb-3" id="weaknesses-title">
              <span className="w-5 h-5 rounded-md bg-rose-500 text-white flex items-center justify-center font-mono text-xs font-black">W</span>
              <span>Weaknesses</span>
            </h4>
            <div className="space-y-2.5 flex-1" id="weaknesses-list">
              {weaknesses.map((item, idx) => (
                <div key={idx} className="bg-white/80 border border-rose-50/60 p-2.5 rounded-xl" id={`weakness-${idx}`}>
                  <p className="text-xs font-bold text-rose-950">{item.title}</p>
                  <p className="text-[11px] text-rose-900/80 mt-0.5 leading-normal">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div className="bg-blue-50/30 border border-blue-100 p-4 rounded-2xl flex flex-col h-full hover:shadow-sm transition-shadow" id="swot-opportunities">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5 mb-3" id="opportunities-title">
              <span className="w-5 h-5 rounded-md bg-blue-500 text-white flex items-center justify-center font-mono text-xs font-black">O</span>
              <span>Opportunities</span>
            </h4>
            <div className="space-y-2.5 flex-1" id="opportunities-list">
              {opportunities.map((item, idx) => (
                <div key={idx} className="bg-white/80 border border-blue-50/60 p-2.5 rounded-xl" id={`opportunity-${idx}`}>
                  <p className="text-xs font-bold text-blue-950">{item.title}</p>
                  <p className="text-[11px] text-blue-900/80 mt-0.5 leading-normal">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Threats */}
          <div className="bg-amber-50/30 border border-amber-100 p-4 rounded-2xl flex flex-col h-full hover:shadow-sm transition-shadow" id="swot-threats">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-3" id="threats-title">
              <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center font-mono text-xs font-black">T</span>
              <span>Threats</span>
            </h4>
            <div className="space-y-2.5 flex-1" id="threats-list">
              {threats.map((item, idx) => (
                <div key={idx} className="bg-white/80 border border-amber-50/60 p-2.5 rounded-xl" id={`threat-${idx}`}>
                  <p className="text-xs font-bold text-amber-950">{item.title}</p>
                  <p className="text-[11px] text-amber-900/80 mt-0.5 leading-normal">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getVerdictLabel = () => {
    switch (type) {
      case "pros_cons":
        return "The Tiebreaker's Verdict";
      case "comparison_table":
        return "The Winner Recommendation";
      case "swot":
        return "The Strategic Solution";
      default:
        return "Tiebreaker Recommendation";
    }
  };

  // Determine possible lock-in option choices
  const getLockOptions = (): string[] => {
    if (type === "comparison_table") {
      const data = rawResponse as ComparisonData;
      return (data.options || []).map(o => o.name);
    } else {
      // For pros/cons or SWOT, simple binary: Yes vs No, or Proceed vs Halt, or dynamic choices
      return ["Proceed / Accept", "Decline / Avoid", "Choose Alternative Path"];
    }
  };

  return (
    <div className="space-y-6 font-sans" id="result-view-container">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4" id="result-view-header">
        <div id="result-title-section">
          <span className="text-[10px] font-bold font-mono bg-slate-100 text-slate-500 rounded px-2 py-0.5 uppercase tracking-wider">
            {type === "pros_cons" ? "Pros & Cons Analysis" : type === "comparison_table" ? "Comparative Matrix" : "SWOT Strategic Quad"}
          </span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-1.5">{title}</h2>
        </div>

        <button
          onClick={onShare}
          className="flex items-center justify-center gap-1.5 text-xs border border-slate-200/80 hover:bg-slate-50 font-semibold text-slate-700 px-3 py-2 rounded-xl transition-all shrink-0 cursor-pointer"
          id="btn-share-result"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Copy Analysis Summary</span>
        </button>
      </div>

      {/* Main Analysis content block */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 md:p-5" id="main-analysis-board">
        {type === "pros_cons" && renderProsCons()}
        {type === "comparison_table" && renderComparisonTable()}
        {type === "swot" && renderSWOT()}
      </div>

      {/* TIEBREAKER VERDICT CARD */}
      <div className="bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800 p-5 md:p-6 relative overflow-hidden" id="verdict-card">
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at top right, white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />

        <div className="relative flex flex-col md:flex-row gap-5 items-start justify-between" id="verdict-card-body">
          <div className="flex-1 space-y-2.5" id="verdict-card-text">
            <h3 className="text-sm font-bold text-amber-400 tracking-wider uppercase flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
              <span>{getVerdictLabel()}</span>
            </h3>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans font-medium whitespace-pre-line">
              {rawResponse.tiebreakerVerdict}
            </p>
          </div>
        </div>

        {/* LOCKED DECISION DISCLOSURE SECTION */}
        <div className="mt-6 pt-5 border-t border-slate-800 font-sans" id="decision-closure-block">
          {userFinalChoice ? (
            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4" id="locked-choice-indicator">
              <div className="flex items-center gap-3" id="indicator-badge">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">Decision Locked In</p>
                  <p className="text-[11px] text-slate-400">Chosen path: <span className="text-emerald-400 font-mono font-bold">{userFinalChoice}</span></p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium font-mono border ${
                followedAI 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}>
                {followedAI ? "✅ Followed Tiebreaker Choice" : "ℹ️ Alternate Path Taken"}
              </span>
            </div>
          ) : (
            <div className="space-y-3" id="decision-locking-controls">
              <div id="locking-labels">
                <p className="text-xs font-bold text-amber-200">Decide & Resolve Analysis Paralysis</p>
                <p className="text-[11px] text-slate-400">Select which path you are locking in to resolve this scenario once and for all:</p>
              </div>

              <div className="flex flex-wrap gap-2" id="locking-buttons-list">
                {getLockOptions().map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => {
                      // We determine if they followed AI. 
                      // If comparison table, they followed AI if they chose the option with the highest cumulative score
                      // Or simply, we ask if this was the recommended outcome. Let's ask them to choose or infer.
                      // For a robust simplified index, we can mark followedAI = true if they pick options or Proceed/Accept, or let them toggle.
                      // Let's assume selecting the first option/Proceed follows the tiebreaker advice, or simply let them click.
                      const isRecommended = oIdx === 0; // Standardize 1st button as standard recommended/positive choice
                      onLockChoice(opt, isRecommended);
                    }}
                    className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-medium px-3.5 py-2 rounded-xl transition-all border border-slate-700 cursor-pointer"
                    id={`btn-lock-${oIdx}`}
                  >
                    <span>{opt}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
