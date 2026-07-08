import React from "react";
import { Gauge, Zap, Compass, Move, Disc, TrendingUp } from "lucide-react";

interface MetricDashboardProps {
  metrics: {
    exitVelocity: number;      // Reused as Throw Velocity
    launchAngle: number;       // Reused as Release Angle
    distance: number;          // Reused as Flight Carry Distance
    attackAngle: number;       // Reused as Elbow Flexion Angle
    verticalBatAngle: number;  // Reused as Release Slot Angle
    squaredUpRate: number;     // Reused as Arm/Whip Efficiency
  };
  isLoading?: boolean;
}

export default function MetricDashboard({ metrics, isLoading = false }: MetricDashboardProps) {
  // Helpers to render circular progress charts
  const renderCircularGauge = (
    value: number,
    min: number,
    max: number,
    title: string,
    unit: string,
    icon: React.ReactNode,
    colorClass: string,
    rating: string,
    idPrefix: string
  ) => {
    const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
    const radius = 40;
    const strokeWidth = 5;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - percentage * circumference;

    return (
      <div id={`${idPrefix}-card`} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{title}</span>
          <span className="text-slate-500">{icon}</span>
        </div>

        <div className="flex items-center gap-4 py-2">
          {/* SVG Ring */}
          <div className="relative w-18 h-18 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="36"
                cy="36"
                r={radius}
                className="stroke-slate-800"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="36"
                cy="36"
                r={radius}
                className={`${colorClass} transition-all duration-500`}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-sm font-bold text-slate-100">{value.toFixed(0)}</span>
              <span className="text-[9px] font-mono font-medium text-slate-500 uppercase">{unit}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-display font-bold text-slate-100 text-lg">
              {value.toFixed(1)} <span className="text-xs font-medium text-slate-400">{unit}</span>
            </div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${colorClass.includes("emerald") ? "text-emerald-400" : "text-amber-400"}`}>
              {rating}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Compute evaluations for key values
  const getVelocityRating = (vel: number) => {
    if (vel >= 95) return "Elite (MLB Cannon)";
    if (vel >= 85) return "Strong Outfield/Infield";
    return "Standard Arm Action";
  };

  const getReleaseAngleRating = (la: number) => {
    if (la >= 6 && la <= 12) return "Infield Frozen Rope";
    if (la >= 13 && la <= 22) return "Outfield Gunning Arc";
    return "High Sail / Drifting Float";
  };

  const getElbowAngleRating = (aa: number) => {
    if (aa >= 90 && aa <= 120) return "Optimal Lever Whip";
    if (aa > 120) return "Casting / Arm Extension Drag";
    return "Tight Push / Limited Range";
  };

  const getWhipRating = (sq: number) => {
    if (sq >= 90) return "Exceptional Whip";
    if (sq >= 75) return "Solid Rotation Connection";
    return "Rotational Leak Warning";
  };

  return (
    <div id="statcast-metric-dashboard" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-4">
        <div className="flex items-center gap-3">
          <Gauge className="w-5 h-5 text-emerald-500" />
          <h2 className="font-display text-lg font-semibold text-slate-100 tracking-tight">
            Defensive Throwing Kinematics (Statcast Scale)
          </h2>
        </div>
        {isLoading && (
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
        )}
      </div>

      {/* Main Grid: Custom Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Release Speed */}
        {renderCircularGauge(
          metrics.exitVelocity,
          50,
          115,
          "Throw Velocity",
          "MPH",
          <Zap className="w-4 h-4 text-amber-400" />,
          "stroke-amber-400",
          getVelocityRating(metrics.exitVelocity),
          "ev"
        )}

        {/* Release Launch Angle */}
        {renderCircularGauge(
          metrics.launchAngle,
          -5,
          40,
          "Release Launch Angle",
          "DEG",
          <Compass className="w-4 h-4 text-emerald-400" />,
          "stroke-emerald-400",
          getReleaseAngleRating(metrics.launchAngle),
          "la"
        )}

        {/* Elbow Flexion Angle */}
        {renderCircularGauge(
          metrics.attackAngle,
          60,
          160,
          "Elbow Flexion Angle",
          "DEG",
          <TrendingUp className="w-4 h-4 text-emerald-500" />,
          "stroke-emerald-500",
          getElbowAngleRating(metrics.attackAngle),
          "aa"
        )}

        {/* Release Arm Slot Angle */}
        {renderCircularGauge(
          Math.abs(metrics.verticalBatAngle),
          15,
          75,
          "Release Slot Angle",
          "DEG",
          <Move className="w-4 h-4 text-sky-400" />,
          "stroke-sky-400",
          metrics.verticalBatAngle < -40 ? "Overhand / Three-Quarters" : "Low Sidearm / Submarine",
          "vba"
        )}

        {/* Arm Whip Efficiency */}
        {renderCircularGauge(
          metrics.squaredUpRate,
          40,
          100,
          "Arm Whip Efficiency",
          "%",
          <Disc className="w-4 h-4 text-emerald-400" />,
          "stroke-emerald-400",
          getWhipRating(metrics.squaredUpRate),
          "squared"
        )}

        {/* Carry Distance Card */}
        <div id="distance-metric-card" className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -mr-6 -mt-6"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Est. Flight Carry</span>
            <span className="text-emerald-500"><Compass className="w-4 h-4" /></span>
          </div>
          <div className="py-2">
            <div className="font-display font-black text-slate-50 text-3xl tracking-tight leading-none">
              {metrics.distance.toFixed(0)} <span className="text-sm font-semibold text-slate-400 font-sans">FT</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-2">
              Ball trajectory carry, based on release speed and backspin lift mechanics.
            </div>
          </div>
          <div className="border-t border-slate-850 pt-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Calibrated Carry Distance
          </div>
        </div>
      </div>
    </div>
  );
}
