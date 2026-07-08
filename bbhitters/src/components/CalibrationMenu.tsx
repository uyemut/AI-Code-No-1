import React, { useState } from "react";
import { CalibrationData } from "../types";
import { Ruler, Settings, Users, Eye } from "lucide-react";

interface CalibrationMenuProps {
  calibration: CalibrationData;
  onChange: (data: CalibrationData) => void;
  isCalibratingRuler: boolean;
  setIsCalibratingRuler: (val: boolean) => void;
}

export default function CalibrationMenu({
  calibration,
  onChange,
  isCalibratingRuler,
  setIsCalibratingRuler,
}: CalibrationMenuProps) {
  const [heightFt, setHeightFt] = useState(Math.floor(calibration.height / 12));
  const [heightIn, setHeightIn] = useState(calibration.height % 12);

  const handleHeightFtChange = (ft: number) => {
    setHeightFt(ft);
    const newHeight = ft * 12 + heightIn;
    onChange({ ...calibration, height: newHeight });
  };

  const handleHeightInChange = (inch: number) => {
    setHeightIn(inch);
    const newHeight = heightFt * 12 + inch;
    onChange({ ...calibration, height: newHeight });
  };

  const handleBatLengthChange = (len: number) => {
    onChange({ ...calibration, batLength: len });
  };

  const handleFpsChange = (fps: number) => {
    onChange({ ...calibration, fps: fps });
  };

  return (
    <div id="calibration-menu-container" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
        <Settings className="w-5 h-5 text-emerald-500" />
        <h2 className="font-display text-lg font-semibold text-slate-100 tracking-tight">
          Hitter Lab Calibration
        </h2>
      </div>

      <div className="space-y-5">
        {/* Hitter Height */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Hitter Height (Reference Object 1)
          </label>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 focus-within:border-emerald-500 transition-colors">
              <input
                id="height-ft-input"
                type="number"
                min="4"
                max="7"
                value={heightFt}
                onChange={(e) => handleHeightFtChange(parseInt(e.target.value) || 5)}
                className="w-full bg-transparent border-none outline-none py-2 text-slate-100 text-sm font-mono text-right pr-2"
              />
              <span className="text-xs font-semibold text-slate-500">FT</span>
            </div>
            <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 focus-within:border-emerald-500 transition-colors">
              <input
                id="height-in-input"
                type="number"
                min="0"
                max="11"
                value={heightIn}
                onChange={(e) => handleHeightInChange(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent border-none outline-none py-2 text-slate-100 text-sm font-mono text-right pr-2"
              />
              <span className="text-xs font-semibold text-slate-500">IN</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Used to calibrate skeletal proportion scaling in the pitch plane.
          </p>
        </div>

        {/* Bat Length */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Bat Length (Reference Object 2)
          </label>
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 focus-within:border-emerald-500 transition-colors">
            <input
              id="bat-length-input"
              type="number"
              step="0.5"
              min="28"
              max="36"
              value={calibration.batLength}
              onChange={(e) => handleBatLengthChange(parseFloat(e.target.value) || 33)}
              className="w-full bg-transparent border-none outline-none py-2 text-slate-100 text-sm font-mono text-right pr-2"
            />
            <span className="text-xs font-semibold text-slate-500">INCHES</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Standard barrel calibration. Ideal for high-precision exit velocity.
          </p>
        </div>

        {/* Frame Rate */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Camera Capture Speed
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[60, 120, 240].map((speed) => (
              <button
                key={speed}
                id={`fps-btn-${speed}`}
                type="button"
                onClick={() => handleFpsChange(speed)}
                className={`py-2 text-xs font-mono rounded-lg border transition-all ${
                  calibration.fps === speed
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold shadow-sm shadow-emerald-500/20"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                {speed} FPS
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            High frame rate enables ultra-fine frame timing interpolation.
          </p>
        </div>

        {/* Pixel Scaling Ruler Calibration */}
        <div className="border-t border-slate-800 pt-4 mt-2">
          <button
            id="pixel-cal-btn"
            type="button"
            onClick={() => setIsCalibratingRuler(!isCalibratingRuler)}
            className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 border text-xs font-medium transition-all ${
              isCalibratingRuler
                ? "bg-emerald-500 border-emerald-400 text-slate-950 font-bold"
                : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Ruler className="w-4 h-4" />
            {isCalibratingRuler ? "Active: Drag Ruler on Video" : "Calibrate Pixel-to-Inch Ruler"}
          </button>
          <div className="bg-slate-950/60 rounded-lg p-3 mt-3 border border-slate-800/60">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Calculated Scale:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {calibration.pixelsPerInch ? `${calibration.pixelsPerInch.toFixed(2)} px/in` : "1.80 px/in (Auto)"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              When calibrating, click and drag the ruler endpoints over the length of the bat in the video. The system automatically locks the reference pixels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
