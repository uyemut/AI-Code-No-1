import React from "react";
import { BiomechanicsData } from "../types";
import { Users, TrendingUp, Info } from "lucide-react";

interface CompareToProProps {
  userBio: BiomechanicsData | null;
  eliteBio: BiomechanicsData;
}

export default function CompareToPro({ userBio, eliteBio }: CompareToProProps) {
  const activeBio = userBio || {
    leadArmAngle: 104,
    hipShoulderSeparation: 32,
    frontKneeBracing: 158,
    leadArmAngleRating: "Optimal",
    frontKneeBracingRating: "Soft Knee/Leaking Energy",
    hipShoulderSeparationRating: "Under-rotated",
  };

  const jointMetrics = [
    {
      name: "Elbow Flexion Angle",
      userVal: activeBio.leadArmAngle,
      eliteVal: eliteBio.leadArmAngle,
      unit: "°",
      desc: "Controls throwing arm lever whip. Too straight/sidearm early creates 'Elbow Drag'.",
      getDelta: (u: number, e: number) => u - e,
      getFeedback: (u: number) => {
        if (u > 130) return { status: "Sidearm Drag", desc: "Arm path is too flat/extended, dragging shoulder plane and risking medial UCL strain.", color: "text-rose-400" };
        if (u < 85) return { status: "Tight Arm Push", desc: "Elbow flexion is too closed. Pushes the ball and reduces physical leverage.", color: "text-amber-400" };
        return { status: "Optimal Lever Whip", desc: "Perfect elbow-to-shoulder stack creates maximum whipping velocity and protects joints.", color: "text-emerald-400" };
      }
    },
    {
      name: "Hip-Shoulder Separation",
      userVal: activeBio.hipShoulderSeparation,
      eliteVal: eliteBio.hipShoulderSeparation,
      unit: "°",
      desc: "The 'X-Factor' stretch between pelvic rotation and upper torso rotation at Front Foot Plant.",
      getDelta: (u: number, e: number) => u - e,
      getFeedback: (u: number) => {
        if (u >= 42) return { status: "Elite Core Torque", desc: "Loaded torso creates supreme core elasticity for 95+ MPH cannon throws.", color: "text-emerald-400" };
        if (u >= 32) return { status: "Optimal Power Stretch", desc: "Excellent torso separation and elastic recoil loading.", color: "text-emerald-500" };
        return { status: "Under-rotated Core", desc: "Pelvis and shoulders turn together, leaking core rotational whip velocity.", color: "text-rose-400" };
      }
    },
    {
      name: "Front Knee Bracing",
      userVal: activeBio.frontKneeBracing,
      eliteVal: eliteBio.frontKneeBracing,
      unit: "°",
      desc: "The front leg serves as an instant deceleration wall. A firm knee is elite.",
      getDelta: (u: number, e: number) => u - e,
      getFeedback: (u: number) => {
        if (u >= 170) return { status: "Rigid Deceleration Wall", desc: "Perfect momentum arrest. Transfers maximum kinetic energy into arm whip.", color: "text-emerald-400" };
        if (u >= 160) return { status: "Stable Support Knee", desc: "Good stability at release plane.", color: "text-emerald-500" };
        return { status: "Energy Leak / Soft Knee", desc: "Knee collapses on plant, leaking forward linear power into the grass.", color: "text-rose-400" };
      }
    }
  ];

  return (
    <div id="compare-to-pro-workspace" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-emerald-500" />
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-100 tracking-tight">
              Compare to Pro Elite Profile
            </h2>
            <p className="text-xs text-slate-400">Side-by-side Joint Angle and Kinematic Sequence alignment</p>
          </div>
        </div>
      </div>

      {/* Joint Angle Compare Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {jointMetrics.map((m) => {
          const delta = m.getDelta(m.userVal, m.eliteVal);
          const feedback = m.getFeedback(m.userVal);

          return (
            <div
              key={m.name}
              id={`compare-card-${m.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wide mb-1">
                  {m.name}
                </span>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {m.desc}
                </p>
              </div>

              {/* Bar Comparison Meter */}
              <div className="space-y-2 py-1">
                <div className="flex justify-between items-end text-xs font-mono">
                  <span className="text-slate-400">YOU: <strong className="text-slate-100">{m.userVal}{m.unit}</strong></span>
                  <span className="text-slate-500">PRO ELITE: <strong className="text-emerald-400">{m.eliteVal}{m.unit}</strong></span>
                </div>
                {/* Horizontal progress bar overlays */}
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden relative border border-slate-800">
                  <div
                    className="absolute h-full bg-emerald-500/20"
                    style={{ width: `${(m.eliteVal / 180) * 100}%` }}
                  ></div>
                  <div
                    className={`absolute h-full ${feedback.color.includes("emerald") ? "bg-emerald-500" : feedback.color.includes("rose") ? "bg-rose-500" : "bg-amber-500"}`}
                    style={{ width: `${(m.userVal / 180) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0{m.unit}</span>
                  <span className="font-semibold text-slate-400">
                    {delta === 0 ? "Perfect Match" : delta > 0 ? `+${delta.toFixed(1)}${m.unit} vs Pro` : `${delta.toFixed(1)}${m.unit} vs Pro`}
                  </span>
                  <span>180{m.unit}</span>
                </div>
              </div>

              {/* Coach Diagnostics Alert Box */}
              <div className="bg-slate-900/60 rounded p-2.5 border border-slate-850">
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${feedback.color}`}>
                  {feedback.status}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  {feedback.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kinematic Sequence Timing chart */}
      <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="font-display font-semibold text-sm text-slate-100">
              Rotational Timing Sequence: Pelvic-to-Torso Deceleration Chain
            </h4>
          </div>
          <span className="text-[10px] font-mono font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
            ELITE TIMING (PRO SEQUENTIAL SHIFT)
          </span>
        </div>

        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Elite throw acceleration occurs as a sequential chain: <strong>Pelvis (Hips) accelerate and decelerate first</strong>, transferring all speed into the <strong>Torso (Chest)</strong>, which then snaps into the <strong>Throwing Arm</strong>, and finally whips the <strong>Baseball</strong> at release. If any sequence overlaps early, velocity leaks.
        </p>

        {/* SVG Custom Timing curves displaying sequential deceleration */}
        <div id="sequential-timing-svg-container" className="relative h-44 border border-slate-850 rounded-lg p-2 bg-slate-950/80">
          <svg className="w-full h-full" viewBox="0 0 500 150">
            {/* Grid references */}
            <line x1="30" y1="120" x2="480" y2="120" stroke="#1e293b" strokeWidth="1" />
            <line x1="30" y1="20" x2="30" y2="120" stroke="#1e293b" strokeWidth="1" />
            <line x1="150" y1="20" x2="150" y2="120" stroke="#1e293b" strokeDasharray="3,3" strokeWidth="1" />
            <line x1="270" y1="20" x2="270" y2="120" stroke="#1e293b" strokeDasharray="3,3" strokeWidth="1" />
            <line x1="330" y1="20" x2="330" y2="120" stroke="#1e293b" strokeDasharray="3,3" strokeWidth="1" />

            {/* Labels for phases */}
            <text x="30" y="135" fill="#475569" fontSize="9" fontFamily="var(--font-mono)">STRIDE/LOAD</text>
            <text x="135" y="135" fill="#475569" fontSize="9" fontFamily="var(--font-mono)">FOOT PLANT</text>
            <text x="250" y="135" fill="#475569" fontSize="9" fontFamily="var(--font-mono)">BALL RELEASE</text>
            <text x="320" y="135" fill="#475569" fontSize="9" fontFamily="var(--font-mono)">FOLLOW-THRU</text>
            
            <text x="15" y="15" fill="#475569" fontSize="8" transform="rotate(-90 15 15)" fontFamily="var(--font-mono)">ACCELERATION</text>

            {/* Curve 1: Pelvis / Hips Timing (Red-orange, peaks early) */}
            <path
              d="M 30,120 Q 90,40 140,40 T 260,120"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              className="opacity-80"
            />
            <text x="110" y="30" fill="#0284c7" fontSize="8" fontWeight="bold">PELVIS (HIPS)</text>

            {/* Curve 2: Torso Timing (Amber, peaks second) */}
            <path
              d="M 60,120 Q 140,50 190,30 T 290,120"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              className="opacity-80"
            />
            <text x="170" y="22" fill="#fbbf24" fontSize="8" fontWeight="bold">TORSO</text>

            {/* Curve 3: Arms Timing (Blue, peaks third) */}
            <path
              d="M 110,120 Q 190,60 230,25 T 310,120"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              className="opacity-80"
            />
            <text x="220" y="15" fill="#06b6d4" fontSize="8" fontWeight="bold">THROWING ARM</text>

            {/* Curve 4: Ball Speed Timing (Emerald, peaks exact at release) */}
            <path
              d="M 140,120 Q 210,80 270,15 T 330,120"
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
            />
            <text x="270" y="10" fill="#10b981" fontSize="9" fontWeight="bold">BASEBALL RELEASE (MAX VELOCITY)</text>
          </svg>
        </div>

        <div className="bg-slate-900 border border-slate-850 rounded p-3 text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            <strong>Diagnose Throw Sequence:</strong> If the Pelvis (blue) curve peaks at the same time as the Torso (amber), or if the Ball Release peaks late, the fielder is &quot;pushing&quot; the ball rather than rotationally whipping it, leading to a substantial drop in throw speed.
          </p>
        </div>
      </div>
    </div>
  );
}
