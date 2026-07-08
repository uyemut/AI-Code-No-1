import { AnalysisType, DecisionResult, ProsConsData, ComparisonData, SWOTData } from "./types";

// State Management
let history: DecisionResult[] = [];
let activeId: string | null = null;
let currentMethod: AnalysisType = "pros_cons";
let currentOptions: string[] = ["Option A", "Option B"];

// Presets data
const presets = [
  {
    title: "Should I buy a brand-new electric vehicle?",
    type: "pros_cons" as AnalysisType,
    context: "I currently drive an old sedan that gets 25 mpg. I have a 30-mile daily commute. I rent an apartment and cannot install a home charger easily, but there's a supercharger 10 minutes away."
  },
  {
    title: "Where should we go for our anniversary?",
    type: "comparison_table" as AnalysisType,
    options: ["A relaxed beach resort in Maui", "An active cultural trip to Tokyo", "A cozy cabin stay in Banff"],
    context: "Budget is around $5000. My partner loves food and museum tours. I prefer hiking and relaxing. We have 7 days total including travel."
  },
  {
    title: "Should I launch my custom side-project app this weekend?",
    type: "swot" as AnalysisType,
    context: "The app is about 80% complete, fully functional but has minor styling issues and no marketing strategy. A competitor just raised seed funding for a similar concept."
  }
];

// Document Selectors
const viewForm = document.getElementById("view-form") as HTMLDivElement;
const viewLoading = document.getElementById("view-loading") as HTMLDivElement;
const viewResults = document.getElementById("view-results") as HTMLDivElement;

const formEl = document.getElementById("decision-form") as HTMLFormElement;
const titleInput = document.getElementById("decision-title") as HTMLInputElement;
const contextInput = document.getElementById("context-input") as HTMLTextAreaElement;
const optionsGroup = document.getElementById("options-input-group") as HTMLDivElement;
const optionsList = document.getElementById("options-inputs-list") as HTMLDivElement;
const btnAddOption = document.getElementById("btn-add-option") as HTMLButtonElement;

const errorBanner = document.getElementById("error-banner") as HTMLDivElement;
const errorText = document.getElementById("error-text") as HTMLParagraphElement;
const btnCloseError = document.getElementById("btn-close-error") as HTMLButtonElement;

const listContainer = document.getElementById("history-list-container") as HTMLDivElement;
const emptyStateEl = document.getElementById("history-empty-state") as HTMLDivElement;
const sidebarStats = document.getElementById("sidebar-stats") as HTMLDivElement;
const statLoggedCount = document.getElementById("stat-logged-count") as HTMLParagraphElement;
const statTrustFactor = document.getElementById("stat-trust-factor") as HTMLParagraphElement;
const statsSummaryText = document.getElementById("stats-summary-text") as HTMLParagraphElement;
const logCountBadge = document.getElementById("log-count") as HTMLSpanElement;

const resultBadge = document.getElementById("result-badge") as HTMLSpanElement;
const resultTitle = document.getElementById("result-title") as HTMLHeadingElement;
const btnCopySummary = document.getElementById("btn-copy-summary") as HTMLButtonElement;
const dynamicResultContainer = document.getElementById("dynamic-result-container") as HTMLDivElement;
const verdictCardTitle = document.getElementById("verdict-card-title") as HTMLSpanElement;
const verdictText = document.getElementById("verdict-text") as HTMLParagraphElement;
const closureSection = document.getElementById("closure-section") as HTMLDivElement;

const btnNewDilemma = document.getElementById("btn-new-dilemma") as HTMLButtonElement;
const btnSidebarNew = document.getElementById("btn-sidebar-new") as HTMLButtonElement;
const btnClearLog = document.getElementById("btn-clear-log") as HTMLButtonElement;
const btnBrand = document.getElementById("btn-brand") as HTMLDivElement;
const toastContainer = document.getElementById("toast-container") as HTMLDivElement;

// Toast helper
function showToast(message: string, isSuccess = true) {
  const toast = document.createElement("div");
  toast.className = `bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-slate-800 transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto`;
  
  const icon = isSuccess 
    ? `<svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`
    : `<svg class="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>`;

  toast.innerHTML = `${icon}<span>${message}</span>`;
  toastContainer.appendChild(toast);
  
  // Animate Entrance
  setTimeout(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  }, 10);

  // Fade and Remove
  setTimeout(() => {
    toast.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Error Banner controls
function showError(msg: string) {
  errorText.textContent = msg;
  errorBanner.classList.remove("hidden");
  errorBanner.scrollIntoView({ behavior: "smooth" });
}

btnCloseError.addEventListener("click", () => {
  errorBanner.classList.add("hidden");
});

// Setup navigation and headers
function resetToNewForm() {
  activeId = null;
  errorBanner.classList.add("hidden");
  viewLoading.classList.add("hidden");
  viewResults.classList.add("hidden");
  viewForm.classList.remove("hidden");
  
  // Reset form elements
  titleInput.value = "";
  contextInput.value = "";
  currentMethod = "pros_cons";
  currentOptions = ["Option A", "Option B"];
  updateMethodToggleStyles();
  renderOptionsList();
  renderSidebarList();
}

btnNewDilemma.addEventListener("click", resetToNewForm);
btnSidebarNew.addEventListener("click", resetToNewForm);
btnBrand.addEventListener("click", resetToNewForm);

// Handle Analysis Method Toggles
const methodButtons = document.querySelectorAll(".method-btn");
methodButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const type = btn.getAttribute("data-type") as AnalysisType;
    if (type) {
      currentMethod = type;
      updateMethodToggleStyles();
    }
  });
});

function updateMethodToggleStyles() {
  methodButtons.forEach((btn) => {
    const type = btn.getAttribute("data-type") as AnalysisType;
    const svg = btn.querySelector("svg") as SVGElement;
    if (type === currentMethod) {
      btn.className = "method-btn flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-1 ring-emerald-500";
      if (svg) svg.className.baseVal = "w-4 h-4 mt-0.5 shrink-0 text-emerald-600";
    } else {
      btn.className = "method-btn flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer border-slate-200 hover:border-slate-300 text-slate-600 bg-white";
      if (svg) svg.className.baseVal = "w-4 h-4 mt-0.5 shrink-0 text-slate-400";
    }
  });

  // Toggle comparison options row visibility
  if (currentMethod === "comparison_table") {
    optionsGroup.classList.remove("hidden");
  } else {
    optionsGroup.classList.add("hidden");
  }
}

// Comparison Matrix Options controls
function renderOptionsList() {
  optionsList.innerHTML = "";
  currentOptions.forEach((option, index) => {
    const row = document.createElement("div");
    row.className = "flex gap-2 items-center option-row";
    row.innerHTML = `
      <span class="text-[10px] font-bold font-mono text-slate-400 w-5">#${index + 1}</span>
      <input
        type="text"
        value="${option}"
        data-index="${index}"
        class="flex-1 text-xs bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-lg px-2.5 py-1.5 outline-none text-slate-800 option-value-input"
        placeholder="e.g. Option ${String.fromCharCode(65 + index)}"
      />
      ${currentOptions.length > 2 ? `
        <button
          type="button"
          data-index="${index}"
          class="btn-remove-option text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer transition-colors"
          title="Remove option"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
          </svg>
        </button>
      ` : ""}
    `;
    optionsList.appendChild(row);
  });

  // Re-attach key input changes and remove buttons
  const valueInputs = optionsList.querySelectorAll(".option-value-input");
  valueInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const idx = parseInt((e.target as HTMLInputElement).getAttribute("data-index") || "0");
      currentOptions[idx] = (e.target as HTMLInputElement).value;
    });
  });

  const removeButtons = optionsList.querySelectorAll(".btn-remove-option");
  removeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const idx = parseInt(target.getAttribute("data-index") || "0");
      if (currentOptions.length > 2) {
        currentOptions.splice(idx, 1);
        renderOptionsList();
      }
    });
  });
}

btnAddOption.addEventListener("click", () => {
  if (currentOptions.length < 5) {
    currentOptions.push(`Option ${String.fromCharCode(65 + currentOptions.length)}`);
    renderOptionsList();
  } else {
    showToast("A comparison matrix has a limit of 5 options.", false);
  }
});

// Load Preset Quick Dilemmas
const presetButtons = document.querySelectorAll(".preset-item");
presetButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const idx = parseInt(btn.getAttribute("data-preset-idx") || "0");
    const preset = presets[idx];
    if (preset) {
      titleInput.value = preset.title;
      currentMethod = preset.type;
      contextInput.value = preset.context;
      if (preset.options) {
        currentOptions = [...preset.options];
      } else {
        currentOptions = ["Option A", "Option B"];
      }
      updateMethodToggleStyles();
      renderOptionsList();
      showToast(`Sample Dilemma Loaded: "${preset.title.substring(0, 35)}..."`);
    }
  });
});

// Handle Form Submission with Gemini AI
formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const context = contextInput.value.trim();

  if (!title) return;

  // Visual Loading Switch
  viewForm.classList.add("hidden");
  viewLoading.classList.remove("hidden");
  errorBanner.classList.add("hidden");

  try {
    const reqBody = {
      decisionTitle: title,
      analysisType: currentMethod,
      options: currentMethod === "comparison_table" ? currentOptions.filter(o => o.trim() !== "") : undefined,
      additionalContext: context || undefined,
    };

    const res = await fetch("/api/decide", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to retrieve strategic breakdown from The Tiebreaker.");
    }

    const newId = `dec-${Date.now()}`;
    const newDecision: DecisionResult = {
      id: newId,
      title: title,
      createdAt: new Date().toISOString(),
      type: currentMethod,
      additionalContext: context || undefined,
      rawResponse: result.data,
    };

    history.unshift(newDecision);
    saveHistory();
    activeId = newId;

    viewLoading.classList.add("hidden");
    viewResults.classList.remove("hidden");
    renderActiveResult();
    renderSidebarList();
    showToast("The Tiebreaker has analyzed your dilemma. Verdict ready.");
  } catch (err: any) {
    console.error(err);
    viewLoading.classList.add("hidden");
    viewForm.classList.remove("hidden");
    showError(err.message || "An unexpected error occurred while communicating with the server.");
  }
});

// Render Results Views
function renderActiveResult() {
  const activeResult = history.find(h => h.id === activeId);
  if (!activeResult) return;

  // Render Title and Headers
  resultTitle.textContent = activeResult.title;
  
  if (activeResult.type === "pros_cons") {
    resultBadge.textContent = "Pros & Cons weight list";
    resultBadge.className = "text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2 py-0.5 uppercase tracking-wider";
    verdictCardTitle.textContent = "The Tiebreaker's Verdict";
    renderProsConsView(activeResult.rawResponse as ProsConsData);
  } else if (activeResult.type === "comparison_table") {
    resultBadge.textContent = "Comparative Score Matrix";
    resultBadge.className = "text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-100 rounded px-2 py-0.5 uppercase tracking-wider";
    verdictCardTitle.textContent = "The Winner Recommendation";
    renderComparisonTableView(activeResult.rawResponse as ComparisonData);
  } else if (activeResult.type === "swot") {
    resultBadge.textContent = "SWOT Strategic Quad";
    resultBadge.className = "text-[10px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-100 rounded px-2 py-0.5 uppercase tracking-wider";
    verdictCardTitle.textContent = "The Strategic Solution";
    renderSWOTView(activeResult.rawResponse as SWOTData);
  }

  // Populate Verdict text
  verdictText.textContent = activeResult.rawResponse.tiebreakerVerdict;

  // Render Closure / Choice Locking section
  renderClosureSection(activeResult);
}

// 1. Rendering Pros & Cons
function renderProsConsView(data: ProsConsData) {
  const pros = data.pros || [];
  const cons = data.cons || [];

  const totalProsWeight = pros.reduce((sum, p) => sum + p.weight, 0);
  const totalConsWeight = cons.reduce((sum, c) => sum + c.weight, 0);
  const balanceMax = Math.max(totalProsWeight + totalConsWeight, 1);
  const prosPercentage = Math.round((totalProsWeight / balanceMax) * 100);
  const consPercentage = Math.round((totalConsWeight / balanceMax) * 100);

  let prosListHtml = pros.map((pro, idx) => `
    <div class="bg-emerald-50/40 border border-emerald-100/80 p-3 rounded-xl hover:bg-emerald-50/60 transition-colors">
      <div class="flex justify-between items-start gap-2">
        <h5 class="text-xs font-bold text-emerald-950 font-sans">${pro.title}</h5>
        <span class="inline-flex items-center rounded bg-emerald-100/60 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-800 shrink-0">
          Impact +${pro.weight}
        </span>
      </div>
      <p class="text-[11px] text-emerald-900/80 mt-1 leading-relaxed">${pro.description}</p>
    </div>
  `).join("");

  let consListHtml = cons.map((con, idx) => `
    <div class="bg-rose-50/40 border border-rose-100/80 p-3 rounded-xl hover:bg-rose-50/60 transition-colors">
      <div class="flex justify-between items-start gap-2">
        <h5 class="text-xs font-bold text-rose-950 font-sans">${con.title}</h5>
        <span class="inline-flex items-center rounded bg-rose-100/60 px-1.5 py-0.5 text-[9px] font-mono font-bold text-rose-800 shrink-0">
          Risk -${con.weight}
        </span>
      </div>
      <p class="text-[11px] text-rose-900/80 mt-1 leading-relaxed">${con.description}</p>
    </div>
  `).join("");

  if (pros.length === 0) prosListHtml = `<p class="text-xs text-slate-400 italic">No pros identified.</p>`;
  if (cons.length === 0) consListHtml = `<p class="text-xs text-slate-400 italic">No cons identified.</p>`;

  dynamicResultContainer.innerHTML = `
    <div class="space-y-6">
      <!-- Balance Bar -->
      <div class="bg-slate-50 border border-slate-150 p-4 rounded-xl">
        <div class="flex justify-between items-center text-xs font-mono mb-2">
          <span class="text-emerald-700 font-bold">Pros Weight (${totalProsWeight})</span>
          <span class="text-rose-700 font-bold">Cons Weight (${totalConsWeight})</span>
        </div>
        <div class="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
          <div style="width: ${prosPercentage}%" class="bg-emerald-500 h-full transition-all duration-500"></div>
          <div style="width: ${consPercentage}%" class="bg-rose-500 h-full transition-all duration-500"></div>
        </div>
        <p class="text-[10px] text-slate-400 mt-2 text-center">
          ${totalProsWeight > totalConsWeight 
            ? `Pros outweigh Cons by <strong>${totalProsWeight - totalConsWeight}</strong> importance score points.` 
            : totalConsWeight > totalProsWeight 
              ? `Cons outweigh Pros by <strong>${totalConsWeight - totalProsWeight}</strong> importance score points.`
              : "Pros and Cons are perfectly balanced in calculated weights."}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Pros -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Pros & Advantages</span>
          </h4>
          <div class="space-y-2.5">${prosListHtml}</div>
        </div>

        <!-- Cons -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Cons & Drawbacks</span>
          </h4>
          <div class="space-y-2.5">${consListHtml}</div>
        </div>
      </div>
    </div>
  `;
}

// 2. Rendering Comparison Table
function renderComparisonTableView(data: ComparisonData) {
  const criteria = data.criteria || [];
  const options = data.options || [];

  const scoreTotals = options.map(option => {
    const sum = option.scores.reduce((total, s) => total + s.score, 0);
    return { name: option.name, total: sum };
  });

  const maxScore = Math.max(...scoreTotals.map(t => t.total), 1);

  let criteriaRowsHtml = criteria.map((crit) => {
    let cellsHtml = options.map((opt) => {
      const scoreObj = opt.scores.find(s => s.criterionId === crit.id);
      const scoreVal = scoreObj ? scoreObj.score : 0;
      const scoreNote = scoreObj ? scoreObj.note : "";

      const scoreBg = scoreVal >= 4 
        ? "bg-emerald-100 text-emerald-800" 
        : scoreVal <= 2 
          ? "bg-rose-100 text-rose-800" 
          : "bg-blue-100 text-blue-800";

      return `
        <td class="p-3 text-center border-l border-slate-200/60 max-w-[200px]">
          <div class="flex flex-col items-center gap-1">
            <span class="inline-flex items-center justify-center font-bold font-mono text-xs w-6 h-6 rounded-full ${scoreBg}">
              ${scoreVal}
            </span>
            ${scoreNote ? `<span class="text-[10px] text-slate-500 text-center leading-normal block">${scoreNote}</span>` : ""}
          </div>
        </td>
      `;
    }).join("");

    return `
      <tr class="hover:bg-slate-50/40 transition-colors">
        <td class="p-3">
          <p class="font-semibold text-slate-800">${crit.name}</p>
          <p class="text-[10px] text-slate-400 mt-0.5 leading-normal">${crit.description}</p>
        </td>
        ${cellsHtml}
      </tr>
    `;
  }).join("");

  let scoreColumnsHtml = options.map((opt) => {
    const total = scoreTotals.find(t => t.name === opt.name)?.total || 0;
    const isWinner = total === maxScore;

    return `
      <td class="p-3 text-center border-l border-slate-200/60">
        <div class="flex flex-col items-center gap-1">
          <span class="text-base font-bold font-mono ${isWinner ? "text-emerald-700" : "text-slate-700"}">
            ${total}
          </span>
          ${isWinner ? `
            <span class="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800">
              <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499c.172-.386.72-.386.892 0l2.164 4.385 4.84.704c.428.062.599.588.29.892l-3.502 3.413.827 4.821c.078.455-.396.8-.799.586l-4.327-2.275-4.328 2.275c-.403.214-.877-.131-.799-.586l.827-4.821-3.502-3.413c-.309-.304-.138-.83.29-.892l4.84-.704 2.163-4.385z" /></svg> High Score
            </span>
          ` : ""}
        </div>
      </td>
    `;
  }).join("");

  dynamicResultContainer.innerHTML = `
    <div class="space-y-6">
      <div class="overflow-x-auto border border-slate-200/80 rounded-xl">
        <table class="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="p-3 font-semibold text-slate-500 w-1/4">Evaluation Criterion</th>
              ${options.map(opt => `<th class="p-3 font-bold text-slate-800 text-center border-l border-slate-200/60">${opt.name}</th>`).join("")}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-150">
            ${criteriaRowsHtml}
            <!-- Score Totals -->
            <tr class="bg-slate-50/80 font-bold border-t border-slate-200">
              <td class="p-3 text-slate-700">Cumulative Score Matrix</td>
              ${scoreColumnsHtml}
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-start gap-2 text-slate-500 bg-slate-50 border border-slate-150 p-3 rounded-xl text-[11px]">
        <svg class="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708.286a.75.75 0 01-1-.49l-.4-.015z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9h.008v.008H12V9zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          Scores are rated from 1 (Poor/Risky) to 5 (Excellent/Highly Optimal) based on parameters designed by AI. Use this breakdown to check which option fulfills the highest balance of strategic needs.
        </p>
      </div>
    </div>
  `;
}

// 3. Rendering SWOT
function renderSWOTView(data: SWOTData) {
  const strengths = data.strengths || [];
  const weaknesses = data.weaknesses || [];
  const opportunities = data.opportunities || [];
  const threats = data.threats || [];

  const sHtml = strengths.map(s => `
    <div class="bg-white/80 border border-emerald-50/60 p-2.5 rounded-xl">
      <p class="text-xs font-bold text-emerald-950">${s.title}</p>
      <p class="text-[11px] text-emerald-900/80 mt-0.5 leading-normal">${s.description}</p>
    </div>
  `).join("");

  const wHtml = weaknesses.map(w => `
    <div class="bg-white/80 border border-rose-50/60 p-2.5 rounded-xl">
      <p class="text-xs font-bold text-rose-950">${w.title}</p>
      <p class="text-[11px] text-rose-900/80 mt-0.5 leading-normal">${w.description}</p>
    </div>
  `).join("");

  const oHtml = opportunities.map(o => `
    <div class="bg-white/80 border border-blue-50/60 p-2.5 rounded-xl">
      <p class="text-xs font-bold text-blue-950">${o.title}</p>
      <p class="text-[11px] text-blue-900/80 mt-0.5 leading-normal">${o.description}</p>
    </div>
  `).join("");

  const tHtml = threats.map(t => `
    <div class="bg-white/80 border border-amber-50/60 p-2.5 rounded-xl">
      <p class="text-xs font-bold text-amber-950">${t.title}</p>
      <p class="text-[11px] text-amber-900/80 mt-0.5 leading-normal">${t.description}</p>
    </div>
  `).join("");

  dynamicResultContainer.innerHTML = `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Strengths -->
        <div class="bg-emerald-50/30 border border-emerald-100 p-4 rounded-2xl flex flex-col h-full hover:shadow-sm transition-shadow">
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-3">
            <span class="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center font-mono text-xs font-black">S</span>
            <span>Strengths (Internal)</span>
          </h4>
          <div class="space-y-2.5 flex-1">${sHtml || `<p class="text-xs text-slate-400 italic">No strengths logged.</p>`}</div>
        </div>

        <!-- Weaknesses -->
        <div class="bg-rose-50/30 border border-rose-100 p-4 rounded-2xl flex flex-col h-full hover:shadow-sm transition-shadow">
          <h4 class="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5 mb-3">
            <span class="w-5 h-5 rounded-md bg-rose-500 text-white flex items-center justify-center font-mono text-xs font-black">W</span>
            <span>Weaknesses (Internal)</span>
          </h4>
          <div class="space-y-2.5 flex-1">${wHtml || `<p class="text-xs text-slate-400 italic">No weaknesses logged.</p>`}</div>
        </div>

        <!-- Opportunities -->
        <div class="bg-blue-50/30 border border-blue-100 p-4 rounded-2xl flex flex-col h-full hover:shadow-sm transition-shadow">
          <h4 class="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5 mb-3">
            <span class="w-5 h-5 rounded-md bg-blue-500 text-white flex items-center justify-center font-mono text-xs font-black">O</span>
            <span>Opportunities (External)</span>
          </h4>
          <div class="space-y-2.5 flex-1">${oHtml || `<p class="text-xs text-slate-400 italic">No opportunities logged.</p>`}</div>
        </div>

        <!-- Threats -->
        <div class="bg-amber-50/30 border border-amber-100 p-4 rounded-2xl flex flex-col h-full hover:shadow-sm transition-shadow">
          <h4 class="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-3">
            <span class="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center font-mono text-xs font-black">T</span>
            <span>Threats (External)</span>
          </h4>
          <div class="space-y-2.5 flex-1">${tHtml || `<p class="text-xs text-slate-400 italic">No threats logged.</p>`}</div>
        </div>
      </div>
    </div>
  `;
}

// Render Choice Locking controls in the verdict banner
function renderClosureSection(result: DecisionResult) {
  if (result.userFinalChoice) {
    // Show locked choice badge
    closureSection.innerHTML = `
      <div class="bg-slate-950/50 rounded-xl p-4 border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-200">Decision Locked In</p>
            <p class="text-[11px] text-slate-400">Chosen path: <span class="text-emerald-400 font-mono font-bold">${result.userFinalChoice}</span></p>
          </div>
        </div>
        <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium font-mono border ${
          result.followedAI 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
            : "bg-slate-800 text-slate-300 border-slate-700"
        }">
          ${result.followedAI ? "✅ Followed Tiebreaker Choice" : "ℹ️ Alternate Path Taken"}
        </span>
      </div>
    `;
  } else {
    // Show select and lock controls
    let options: string[] = [];
    if (result.type === "comparison_table") {
      const data = result.rawResponse as ComparisonData;
      options = (data.options || []).map(o => o.name);
    } else {
      options = ["Proceed / Accept Advice", "Decline / Avoid Risk", "Choose Alternative Path"];
    }

    const buttonsHtml = options.map((opt, oIdx) => `
      <button
        type="button"
        data-choice="${opt}"
        data-index="${oIdx}"
        class="btn-lock-choice flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-medium px-3.5 py-2 rounded-xl transition-all border border-slate-700 cursor-pointer"
      >
        <span>${opt}</span>
        <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
      </button>
    `).join("");

    closureSection.innerHTML = `
      <div class="space-y-3">
        <div>
          <p class="text-xs font-bold text-amber-200">Decide & Resolve Analysis Paralysis</p>
          <p class="text-[11px] text-slate-400">Select which path you are locking in to resolve this scenario once and for all:</p>
        </div>
        <div class="flex flex-wrap gap-2">${buttonsHtml}</div>
      </div>
    `;

    // Add locking triggers
    const lockButtons = closureSection.querySelectorAll(".btn-lock-choice");
    lockButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const choice = btn.getAttribute("data-choice") || "";
        const idx = parseInt(btn.getAttribute("data-index") || "0");
        // We assume index 0 (1st option or highest score) follows the standard recommendations
        const followedAI = idx === 0;
        lockUserChoice(choice, followedAI);
      });
    });
  }
}

// Lock choice handler
function lockUserChoice(choice: string, followedAI: boolean) {
  history = history.map((item) => {
    if (item.id === activeId) {
      return {
        ...item,
        userFinalChoice: choice,
        followedAI,
      };
    }
    return item;
  });
  saveHistory();
  renderActiveResult();
  renderSidebarList();
  showToast(`Decision locked in: "${choice}"`);
}

// Share text to clipboard
btnCopySummary.addEventListener("click", () => {
  const activeResult = history.find(h => h.id === activeId);
  if (!activeResult) return;

  try {
    const formattedText = `The Tiebreaker Analysis: "${activeResult.title}"\nMethod: ${activeResult.type.toUpperCase()}\nVerdict:\n${activeResult.rawResponse.tiebreakerVerdict}`;
    navigator.clipboard.writeText(formattedText);
    showToast("Analysis summary copied to clipboard!");
  } catch (err) {
    showToast("Unable to copy to clipboard.", false);
  }
});

// Render Sidebar List & Stats
function renderSidebarList() {
  listContainer.innerHTML = "";
  
  if (history.length === 0) {
    emptyStateEl.classList.remove("hidden");
    sidebarStats.classList.add("hidden");
    logCountBadge.classList.add("hidden");
    return;
  }

  emptyStateEl.classList.add("hidden");
  sidebarStats.classList.remove("hidden");
  logCountBadge.classList.remove("hidden");
  logCountBadge.textContent = history.length.toString();

  // Render items
  history.forEach((item) => {
    const isActive = item.id === activeId;
    
    // Icon based on type
    let iconSvg = "";
    if (item.type === "pros_cons") {
      iconSvg = `<svg class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>`;
    } else if (item.type === "comparison_table") {
      iconSvg = `<svg class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>`;
    } else if (item.type === "swot") {
      iconSvg = `<svg class="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V4zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>`;
    }

    const itemEl = document.createElement("div");
    itemEl.className = `group relative flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 border cursor-pointer ${
      isActive
        ? "bg-white border-slate-300 shadow-sm ring-1 ring-slate-100"
        : "bg-transparent border-transparent hover:bg-slate-200/50 hover:border-slate-200"
    }`;

    itemEl.innerHTML = `
      <div class="flex items-start gap-2.5 min-w-0 pr-6 select-none">
        ${iconSvg}
        <div class="min-w-0">
          <p class="text-xs font-medium truncate ${isActive ? "text-slate-950 font-semibold" : "text-slate-700"}">
            ${item.title}
          </p>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="text-[10px] text-slate-400 font-mono">
              ${new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
            ${item.userFinalChoice ? `
              <span class="inline-flex items-center rounded bg-slate-100 px-1 font-mono text-[9px] font-medium text-slate-600">
                ${item.followedAI ? "Followed Tiebreaker" : "Custom Path"}
              </span>
            ` : ""}
          </div>
        </div>
      </div>
      <button
        type="button"
        data-delete-id="${item.id}"
        class="btn-delete-log opacity-0 group-hover:opacity-100 focus:opacity-100 absolute right-2 text-slate-400 hover:text-rose-600 p-1 rounded transition-opacity cursor-pointer"
        title="Delete from log"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
    `;

    // Click handler to select logged item
    itemEl.addEventListener("click", (e) => {
      const deleteBtn = (e.target as HTMLElement).closest(".btn-delete-log");
      if (deleteBtn) return; // Prevent selection trigger if deleting

      activeId = item.id;
      viewForm.classList.add("hidden");
      viewLoading.classList.add("hidden");
      viewResults.classList.remove("hidden");
      renderActiveResult();
      renderSidebarList();
    });

    listContainer.appendChild(itemEl);
  });

  // Attach delete listeners
  const deleteButtons = listContainer.querySelectorAll(".btn-delete-log");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-delete-id") || "";
      deleteLogItem(id);
    });
  });

  // Calculate statistics
  const totalDecisions = history.length;
  const decisionsWithChoices = history.filter(h => h.userFinalChoice).length;
  const followedAIActive = history.filter(h => h.followedAI).length;
  const followedAIPercentage = decisionsWithChoices > 0 
    ? Math.round((followedAIActive / decisionsWithChoices) * 100) 
    : 0;

  statLoggedCount.textContent = totalDecisions.toString();
  statTrustFactor.textContent = decisionsWithChoices > 0 ? `${followedAIPercentage}%` : "—";
  
  if (decisionsWithChoices > 0) {
    statsSummaryText.textContent = `You followed the Tiebreaker on ${followedAIActive} of ${decisionsWithChoices} locked choices.`;
  } else {
    statsSummaryText.textContent = "Decide on an option to update your Trust Factor.";
  }
}

// Delete log item
function deleteLogItem(id: string) {
  history = history.filter((h) => h.id !== id);
  saveHistory();
  if (activeId === id) {
    if (history.length > 0) {
      activeId = history[0].id;
      renderActiveResult();
    } else {
      resetToNewForm();
    }
  } else {
    renderSidebarList();
  }
  showToast("Decision log removed.");
}

// Clear all logged decisions
btnClearLog.addEventListener("click", () => {
  if (confirm("Are you sure you want to permanently clear your entire decision log? This cannot be undone.")) {
    history = [];
    saveHistory();
    resetToNewForm();
    showToast("Logged decisions successfully cleared.");
  }
});

// LocalStorage Persistence
function saveHistory() {
  try {
    localStorage.setItem("tiebreaker_history_v1", JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save history to localStorage", e);
  }
}

function loadHistory() {
  try {
    const stored = localStorage.getItem("tiebreaker_history_v1");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        history = parsed;
        if (parsed.length > 0) {
          activeId = parsed[0].id;
          viewForm.classList.add("hidden");
          viewResults.classList.remove("hidden");
          renderActiveResult();
        }
      }
    }
  } catch (e) {
    console.error("Failed to parse history from localStorage", e);
  }
  
  updateMethodToggleStyles();
  renderOptionsList();
  renderSidebarList();
}

// Initialize on start
loadHistory();
