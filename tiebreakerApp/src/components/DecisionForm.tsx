import React, { useState, useEffect } from "react";
import { AnalysisType } from "../types";
import { 
  Scale, 
  Compass, 
  Grid, 
  Plus, 
  Minus, 
  Sparkles, 
  HelpCircle,
  Lightbulb
} from "lucide-react";

interface DecisionFormProps {
  onSubmit: (data: {
    decisionTitle: string;
    analysisType: AnalysisType;
    options?: string[];
    additionalContext?: string;
  }) => void;
  isLoading: boolean;
}

export default function DecisionForm({ onSubmit, isLoading }: DecisionFormProps) {
  const [decisionTitle, setDecisionTitle] = useState("");
  const [analysisType, setAnalysisType] = useState<AnalysisType>("pros_cons");
  const [options, setOptions] = useState<string[]>(["Option A", "Option B"]);
  const [additionalContext, setAdditionalContext] = useState("");

  // Auto-adjust default options when switching type
  useEffect(() => {
    if (analysisType === "comparison_table") {
      if (options.length < 2) {
        setOptions(["Option A", "Option B"]);
      }
    }
  }, [analysisType]);

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, `Option ${String.fromCharCode(65 + options.length)}`]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionTitle.trim()) return;

    onSubmit({
      decisionTitle,
      analysisType,
      options: analysisType === "comparison_table" ? options.filter(o => o.trim() !== "") : undefined,
      additionalContext: additionalContext.trim() || undefined,
    });
  };

  const loadPreset = (preset: {
    title: string;
    type: AnalysisType;
    options?: string[];
    context: string;
  }) => {
    setDecisionTitle(preset.title);
    setAnalysisType(preset.type);
    if (preset.options) {
      setOptions(preset.options);
    }
    setAdditionalContext(preset.context);
  };

  const presets = [
    {
      id: "preset-electric-car",
      title: "Should I buy a brand-new electric vehicle?",
      type: "pros_cons" as AnalysisType,
      context: "I currently drive an old sedan that gets 25 mpg. I have a 30-mile daily commute. I rent an apartment and cannot install a home charger easily, but there's a supercharger 10 minutes away."
    },
    {
      id: "preset-vacation",
      title: "Where should we go for our anniversary?",
      type: "comparison_table" as AnalysisType,
      options: ["A relaxed beach resort in Maui", "An active cultural trip to Tokyo", "A cozy cabin stay in Banff"],
      context: "Budget is around $5000. My partner loves food and museum tours. I prefer hiking and relaxing. We have 7 days total including travel."
    },
    {
      id: "preset-project",
      title: "Should I launch my custom side-project app this weekend?",
      type: "swot" as AnalysisType,
      context: "The app is about 80% complete, fully functional but has minor styling issues and no marketing strategy. A competitor just raised seed funding for a similar concept."
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 space-y-6 font-sans" id="decision-form-container">
      {/* Title / Objective */}
      <div id="form-header">
        <h3 className="text-base font-semibold text-slate-800 tracking-tight flex items-center gap-1.5">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span>Formulate Your Dilemma</span>
        </h3>
        <p className="text-slate-500 text-xs mt-0.5">
          Tell us what choice you are weighing. The Tiebreaker will analyze the details and suggest a direction.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" id="decision-form">
        {/* Decision Title Input */}
        <div className="space-y-1.5" id="title-input-container">
          <label htmlFor="decision-title" className="block text-xs font-semibold text-slate-600">
            The Decision <span className="text-rose-500">*</span>
          </label>
          <input
            id="decision-title"
            type="text"
            required
            disabled={isLoading}
            value={decisionTitle}
            onChange={(e) => setDecisionTitle(e.target.value)}
            placeholder="e.g. Should I accept the offer from the startup or stay at the big tech firm?"
            className="w-full text-sm bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-3.5 py-2.5 outline-none transition-all duration-200 placeholder-slate-400 text-slate-900"
          />
        </div>

        {/* Analysis Type Toggle Buttons */}
        <div className="space-y-2" id="type-select-container">
          <label className="block text-xs font-semibold text-slate-600">
            Analysis Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" id="analysis-type-grid">
            {/* Pros & Cons */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setAnalysisType("pros_cons")}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                analysisType === "pros_cons"
                  ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-1 ring-emerald-500"
                  : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
              }`}
              id="btn-type-pros-cons"
            >
              <Scale className={`w-4 h-4 mt-0.5 shrink-0 ${analysisType === "pros_cons" ? "text-emerald-600" : "text-slate-400"}`} />
              <div>
                <p className="text-xs font-semibold">Pros & Cons List</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Classic trade-off weight comparison</p>
              </div>
            </button>

            {/* Comparison Table */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setAnalysisType("comparison_table")}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                analysisType === "comparison_table"
                  ? "border-blue-500 bg-blue-50/50 text-blue-950 ring-1 ring-blue-500"
                  : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
              }`}
              id="btn-type-comparison"
            >
              <Compass className={`w-4 h-4 mt-0.5 shrink-0 ${analysisType === "comparison_table" ? "text-blue-600" : "text-slate-400"}`} />
              <div>
                <p className="text-xs font-semibold">Comparative Table</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Multi-option criteria score matrix</p>
              </div>
            </button>

            {/* SWOT */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setAnalysisType("swot")}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                analysisType === "swot"
                  ? "border-amber-500 bg-amber-50/50 text-amber-950 ring-1 ring-amber-500"
                  : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
              }`}
              id="btn-type-swot"
            >
              <Grid className={`w-4 h-4 mt-0.5 shrink-0 ${analysisType === "swot" ? "text-amber-600" : "text-slate-400"}`} />
              <div>
                <p className="text-xs font-semibold">SWOT Analysis</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Strategic matrix for major moves</p>
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Options Input (Only shown for comparison table) */}
        {analysisType === "comparison_table" && (
          <div className="space-y-2 border-l-2 border-blue-100 pl-4 py-1" id="options-input-group">
            <div className="flex items-center justify-between" id="options-label-container">
              <label className="text-xs font-semibold text-slate-600">
                Options to Compare (2 - 5)
              </label>
              <button
                type="button"
                disabled={isLoading || options.length >= 5}
                onClick={handleAddOption}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 cursor-pointer"
                id="btn-add-option-row"
              >
                <Plus className="w-3 h-3" />
                <span>Add Option</span>
              </button>
            </div>

            <div className="space-y-2" id="options-inputs-list">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2 items-center" id={`option-row-${index}`}>
                  <span className="text-[10px] font-bold font-mono text-slate-400 w-5">
                    #{index + 1}
                  </span>
                  <input
                    type="text"
                    disabled={isLoading}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`e.g. Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-lg px-2.5 py-1.5 outline-none text-slate-800"
                    id={`option-input-${index}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleRemoveOption(index)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer transition-colors"
                      title="Remove option"
                      id={`btn-remove-option-${index}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Context Field */}
        <div className="space-y-1.5" id="context-input-container">
          <div className="flex justify-between items-center" id="context-label-row">
            <label htmlFor="context-input" className="text-xs font-semibold text-slate-600">
              Additional Context / Constraints (Optional)
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Be as detailed as you like</span>
          </div>
          <textarea
            id="context-input"
            disabled={isLoading}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            rows={3}
            placeholder="e.g. Startup is remote, stay-at-home has stable tenure. I have some financial runway, but I am looking to grow my leadership skills and take some measured risks."
            className="w-full text-sm bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-3.5 py-2.5 outline-none transition-all duration-200 placeholder-slate-400 text-slate-900 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !decisionTitle.trim()}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl py-3 transition-colors duration-200 shadow-sm cursor-pointer"
          id="btn-break-tie"
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{isLoading ? "Consulting AI..." : "Break the Tie"}</span>
        </button>
      </form>

      {/* Preset Quick Picks */}
      <div className="pt-4 border-t border-slate-100" id="preset-container">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Or try a sample dilemma</span>
        </p>
        <div className="flex flex-col gap-2" id="preset-list">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={isLoading}
              onClick={() => loadPreset(preset)}
              className="text-left text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-150 p-2.5 rounded-xl transition-all flex justify-between items-center group cursor-pointer"
              id={`preset-button-${preset.id}`}
            >
              <div className="min-w-0 pr-4" id={`preset-info-${preset.id}`}>
                <p className="font-medium text-slate-700 truncate">{preset.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{preset.context}</p>
              </div>
              <span className="shrink-0 text-[10px] font-mono font-medium px-2 py-0.5 bg-white text-slate-500 rounded border border-slate-200 group-hover:border-slate-300">
                {preset.type === "pros_cons" ? "Pros & Cons" : preset.type === "comparison_table" ? "Table" : "SWOT"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
