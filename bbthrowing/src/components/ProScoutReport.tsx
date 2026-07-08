import React from "react";
import { ScoutReport, ThrowFlaw } from "../types";
import { Award, AlertTriangle, ShieldCheck, CheckCircle2, Star, BookOpen } from "lucide-react";

interface ProScoutReportProps {
  report: ScoutReport | null;
  flaws: ThrowFlaw[] | null;
}

export default function ProScoutReport({ report, flaws }: ProScoutReportProps) {
  if (!report) {
    return (
      <div id="scout-report-empty" className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
        <Star className="w-8 h-8 mx-auto text-slate-700 mb-3 animate-pulse" />
        <p className="text-sm font-display">Upload a throwing video or select a pro defensive throw profile to generate Scouting & Coaching Engine diagnostics.</p>
      </div>
    );
  }

  const activeFlaws = flaws?.filter((f) => f.detected) || [];

  return (
    <div id="pro-scout-report-section" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
      {/* Header with efficiency banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-5">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="font-display text-lg font-bold text-slate-50 tracking-tight">
              Pro Kinematics Throwing Scout Report
            </h2>
            <p className="text-xs text-slate-400">Fielder Throw Lab arm-efficiency diagnostic engine</p>
          </div>
        </div>

        {/* Throwing Efficiency Gauge Block */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2.5 border border-slate-800 rounded-xl self-start md:self-auto">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Throwing Efficiency</div>
            <div className="text-xs font-mono font-semibold text-emerald-400">Kinematic Sequencing</div>
          </div>
          <div className="text-3xl font-display font-black text-emerald-400 font-mono tracking-tight">
            {report.swingEfficiency}%
          </div>
        </div>
      </div>

      {/* Scout Summary & Release Point Alignment Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" /> Executive Analytics Summary
          </h3>
          <div className="bg-slate-950/50 border border-slate-850 rounded-lg p-4 leading-relaxed text-slate-200 text-sm">
            {report.summary}
          </div>
        </div>

        {/* Release Alignment depth card */}
        <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Release Point Alignment
            </span>
            <div className={`text-lg font-display font-bold ${report.contactDepth === "Optimal" ? "text-emerald-400" : "text-amber-400"}`}>
              {report.contactDepth} (vs Pivot Axis)
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {report.contactDepth === "Optimal" 
              ? "Release occurred exactly 1.5 inches out front of the lead shoulder pivot plane, guaranteeing maximum extension and backspin rotation."
              : "Release occurred too far back or pushed sidearm, causing an early arm-deceleration or shoulder open leak."}
          </div>
          <div className="border-t border-slate-850 pt-2 mt-3 flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>ARM SPEED INDEX:</span>
            <span className="text-slate-300 font-bold">{report.squaredUpRate}%</span>
          </div>
        </div>
      </div>

      {/* Kinematic Flaws Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-emerald-500" /> Kinetic Flaw Detection
        </h3>

        {activeFlaws.length === 0 ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-emerald-400">No Flaws Detected.</span> Kinematic sequencing conforms precisely with elite professional standard timing constraints (pelvic rotation deceleration occurs immediately prior to upper arm release, maximizing elastic force).
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeFlaws.map((flaw) => (
              <div
                key={flaw.type}
                id={`flaw-card-${flaw.type.replace(/\s+/g, "-")}`}
                className="bg-slate-950/80 border border-rose-950 rounded-lg p-4 flex items-start gap-3.5"
              >
                <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-slate-200 text-sm">{flaw.type}</span>
                    <span className="text-[9px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded uppercase">
                      {flaw.severity} Severity
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {flaw.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Corrective Training Drills */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Prescribed Corrective Drills
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.drills.map((drill, index) => (
            <div
              key={drill.name}
              id={`drill-card-${index}`}
              className="bg-slate-950 border border-slate-850 rounded-xl p-5 hover:border-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="font-display font-bold text-sm text-slate-100">{drill.name}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {drill.instructions}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
