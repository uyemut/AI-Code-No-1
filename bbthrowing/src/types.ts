export interface ThrowPhase {
  phase: "Load/Cocking" | "Foot Plant" | "Release Point" | "Follow-Through";
  timestamp: number; // in seconds, e.g., 0.45
  frame: number;     // frame index, e.g., 54
  description: string;
}

export interface BiomechanicsData {
  leadArmAngle: number;           // degrees (reused as Elbow Flexion Angle)
  hipShoulderSeparation: number;  // degrees (X-Factor torque)
  frontKneeBracing: number;       // degrees (Lead leg bracing)
  leadArmAngleRating: string;
  frontKneeBracingRating: string;
  hipShoulderSeparationRating: string;
}

export interface ThrowFlaw {
  type: "Elbow Drag" | "Flying Open" | "None";
  detected: boolean;
  severity: "High" | "Medium" | "None";
  description: string;
}

export interface Drill {
  name: string;
  instructions: string;
}

export interface ScoutReport {
  swingEfficiency: number;        // percentage (reused as Arm/Throw Efficiency)
  summary: string;
  drills: Drill[];
  squaredUpRate: number;          // percentage (reused as Release Efficiency / Spin Index)
  contactDepth: string;           // "Optimal" | "Leaked" | "De-celerated" (reused as Release Point Alignment)
}

export interface CalibrationData {
  batLength: number;             // inches (default: 30, reused as Arm/Reach Length)
  height: number;                // inches (default: 72, player height)
  fps: number;                   // frames per second (default: 120)
  pixelsPerInch?: number;        // calculated pixel scale
}

export interface AnalysisResult {
  phases: ThrowPhase[];
  biomechanics: BiomechanicsData;
  swingFlaws: ThrowFlaw[];
  scoutReport: ScoutReport;
}

export interface PreloadedSwing {
  id: string;
  name: string;
  type: "Infield Gunner" | "Outfield Cannon" | "Amateur (Flawed)";
  description: string;
  videoUrl: string; // fallback visual markers
  analysis: AnalysisResult;
  statcast: {
    exitVelocity: number;       // mph (reused as Throw Velocity)
    launchAngle: number;        // degrees (reused as Release Angle)
    distance: number;           // feet (reused as Carry Distance)
    attackAngle: number;        // degrees (reused as Elbow Extension Angle)
    verticalBatAngle: number;   // degrees (reused as Release Slot Angle)
  };
}
