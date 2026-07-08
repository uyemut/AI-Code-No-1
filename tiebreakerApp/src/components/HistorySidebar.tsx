import React from "react";
import { DecisionResult } from "../types";
import { 
  GitCommit, 
  Trash2, 
  Plus, 
  HelpCircle, 
  TrendingUp, 
  Compass, 
  Scale, 
  Grid 
} from "lucide-react";

interface HistorySidebarProps {
  history: DecisionResult[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onNewDecision: () => void;
}

export default function HistorySidebar({
  history,
  activeId,
  onSelect,
  onDelete,
  onClearAll,
  onNewDecision,
}: HistorySidebarProps) {
  // Statistics calculations
  const totalDecisions = history.length;
  const decisionsWithChoices = history.filter(h => h.userFinalChoice).length;
  const followedAIActive = history.filter(h => h.followedAI).length;
  const followedAIPercentage = decisionsWithChoices > 0 
    ? Math.round((followedAIActive / decisionsWithChoices) * 100) 
    : 0;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pros_cons":
        return <Scale className="w-4 h-4 text-emerald-500" />;
      case "comparison_table":
        return <Compass className="w-4 h-4 text-blue-500" />;
      case "swot":
        return <Grid className="w-4 h-4 text-amber-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50/50 flex flex-col h-full shrink-0" id="history-sidebar">
      {/* Header Button */}
      <div className="p-4 border-b border-slate-200/80 flex gap-2 items-center justify-between" id="history-header">
        <h2 className="font-sans font-semibold text-slate-800 text-sm tracking-tight flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-slate-600 animate-pulse" />
          <span>Decisions Log</span>
          {totalDecisions > 0 && (
            <span className="bg-slate-200/80 text-slate-700 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
              {totalDecisions}
            </span>
          )}
        </h2>
        <button
          onClick={onNewDecision}
          className="flex items-center gap-1 text-xs bg-slate-900 hover:bg-slate-800 text-white font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          title="New Decision"
          id="btn-new-decision-sidebar"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Decisions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5" id="history-list-container">
        {history.length === 0 ? (
          <div className="text-center py-8 px-4" id="empty-history-placeholder">
            <p className="text-slate-400 text-xs font-sans">No decisions logged yet.</p>
            <p className="text-slate-400 text-[10px] mt-1 font-sans">Submit a scenario to begin.</p>
          </div>
        ) : (
          history.map((item) => {
            const isActive = item.id === activeId;
            return (
              <div
                key={item.id}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? "bg-white border-slate-300 shadow-sm ring-1 ring-slate-100"
                    : "bg-transparent border-transparent hover:bg-slate-200/50 hover:border-slate-200"
                }`}
                onClick={() => onSelect(item.id)}
                id={`history-item-${item.id}`}
              >
                <div className="flex items-start gap-2.5 min-w-0 pr-6" id={`history-meta-${item.id}`}>
                  <div className="mt-0.5 shrink-0" id={`history-icon-container-${item.id}`}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="min-w-0" id={`history-info-${item.id}`}>
                    <p className={`text-xs font-medium font-sans truncate ${isActive ? "text-slate-950" : "text-slate-700"}`}>
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5" id={`history-sub-info-${item.id}`}>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {item.userFinalChoice && (
                        <span className="inline-flex items-center rounded bg-slate-100 px-1 font-mono text-[9px] font-medium text-slate-600">
                          {item.followedAI ? "Followed Tiebreaker" : "Custom Path"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 absolute right-2 text-slate-400 hover:text-rose-600 p-1 rounded transition-opacity cursor-pointer"
                  title="Delete from log"
                  id={`btn-delete-${item.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Statistics Section */}
      {history.length > 0 && (
        <div className="p-4 bg-white border-t border-slate-200/80 font-sans" id="history-stats">
          <div className="flex items-center justify-between mb-3" id="stats-header">
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Decisiveness Index</span>
            </h3>
            <button
              onClick={onClearAll}
              className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer font-medium"
              id="btn-clear-history"
            >
              Clear Log
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3" id="stats-grid">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100" id="stat-total-card">
              <p className="text-[10px] text-slate-500 font-medium leading-none">Logged</p>
              <p className="text-xl font-semibold text-slate-800 font-mono mt-1">{totalDecisions}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100" id="stat-adv-card">
              <p className="text-[10px] text-slate-500 font-medium leading-none">Trust Factor</p>
              <p className="text-xl font-semibold text-slate-800 font-mono mt-1">
                {decisionsWithChoices > 0 ? `${followedAIPercentage}%` : "—"}
              </p>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 text-center">
            {decisionsWithChoices > 0 
              ? `You followed the Tiebreaker on ${followedAIActive} of ${decisionsWithChoices} locked choices.`
              : "Decide on an option to update your Trust Factor."}
          </p>
        </div>
      )}
    </div>
  );
}
