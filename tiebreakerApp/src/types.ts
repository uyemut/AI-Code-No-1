export type AnalysisType = "pros_cons" | "comparison_table" | "swot";

export interface ProConItem {
  title: string;
  description: string;
  weight: number; // 1 to 5
}

export interface ProsConsData {
  decisionTitle: string;
  pros: ProConItem[];
  cons: ProConItem[];
  tiebreakerVerdict: string;
}

export interface Criterion {
  id: string;
  name: string;
  description: string;
}

export interface OptionScore {
  criterionId: string;
  score: number; // 1 to 5
  note: string;
}

export interface OptionItem {
  name: string;
  scores: OptionScore[];
}

export interface ComparisonData {
  decisionTitle: string;
  criteria: Criterion[];
  options: OptionItem[];
  tiebreakerVerdict: string;
}

export interface SWOTItem {
  title: string;
  description: string;
}

export interface SWOTData {
  decisionTitle: string;
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
  tiebreakerVerdict: string;
}

export interface DecisionResult {
  id: string;
  title: string;
  createdAt: string;
  type: AnalysisType;
  additionalContext?: string;
  rawResponse: ProsConsData | ComparisonData | SWOTData;
  userFinalChoice?: string; // What choice they actually locked in
  followedAI?: boolean; // If they followed the Tiebreaker's choice
}
