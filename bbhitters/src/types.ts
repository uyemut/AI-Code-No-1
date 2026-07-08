export interface SwingPhase {
  phase: "Stance/Load" | "Toe-Touch" | "Launch/Contact" | "Follow-Through";
  timestamp: number; // in seconds, e.g., 0.45
  frame: number;     // frame index, e.g., 54
  description: string;
}

export interface BiomechanicsData {
  leadArmAngle: number;           // degrees
  hipShoulderSeparation: number;  // degrees (X-Factor)
  frontKneeBracing: number;       // degrees
  leadArmAngleRating: string;
  frontKneeBracingRating: string;
  hipShoulderSeparationRating: string;
}

export interface SwingFlaw {
  type: "Casting" | "Dropping the Barrel" | "None";
  detected: boolean;
  severity: "High" | "Medium" | "None";
  description: string;
}

export interface Drill {
  name: string;
  instructions: string;
}

export interface ScoutReport {
  swingEfficiency: number;        // percentage
  summary: string;
  drills: Drill[];
  squaredUpRate: number;          // percentage
  contactDepth: string;           // "Optimal" | "Too Deep" | "Too Far Out"
}

export interface CalibrationData {
  batLength: number;             // inches (default: 34)
  height: number;                // inches (default: 74)
  fps: number;                   // frames per second (default: 120)
  pixelsPerInch?: number;        // calculated pixel scale
}

export interface AnalysisResult {
  phases: SwingPhase[];
  biomechanics: BiomechanicsData;
  swingFlaws: SwingFlaw[];
  scoutReport: ScoutReport;
}

export interface PreloadedSwing {
  id: string;
  name: string;
  type: "Pro Elite" | "Pro Contact" | "Amateur (Flawed)";
  description: string;
  videoUrl: string; // we can use standard visual mock canvas or generic paths, but we will make it interactive with customizable mock videos (or visual cues) so it runs beautifully!
  analysis: AnalysisResult;
  statcast: {
    exitVelocity: number;       // mph
    launchAngle: number;        // degrees
    distance: number;           // feet
    attackAngle: number;        // degrees
    verticalBatAngle: number;   // degrees
  };
}
