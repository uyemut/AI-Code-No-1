import { PreloadedSwing } from "./types";

export const PRELOADED_SWINGS: PreloadedSwing[] = [
  {
    id: "elite-power-pull",
    name: "Elite Power Pull Swing",
    type: "Pro Elite",
    description: "Inspired by Shohei Ohtani. Features a dynamic leg kick, elite hip-shoulder separation, and a straight, high-force lead leg brace that maximizes energy transfer into a +14° attack angle.",
    videoUrl: "", // Handled beautifully by our interactive canvas simulator inside the player
    analysis: {
      phases: [
        {
          phase: "Stance/Load",
          timestamp: 0.20,
          frame: 24,
          description: "Stance is wide and active. Hands are positioned high near the rear ear. Weight shifts 65% to the rear hip as the pelvis registers a robust -15° counter-rotation load."
        },
        {
          phase: "Toe-Touch",
          timestamp: 0.55,
          frame: 66,
          description: "Stride foot touches down lightly. Hips begin their rapid forward firing sequence while the hands hold their loaded position, building an elite 46° of torque stretch (X-Factor)."
        },
        {
          phase: "Launch/Contact",
          timestamp: 0.72,
          frame: 86,
          description: "Exact contact point. The lead arm is extended at a highly leverageable 164° angle, and the front knee is fully straight (178° brace), completely arresting forward linear speed."
        },
        {
          phase: "Follow-Through",
          timestamp: 1.15,
          frame: 138,
          description: "Powerful chest release facing the pitcher, bat wraps high above the lead shoulder. Balanced stance on the rear toe."
        }
      ],
      biomechanics: {
        leadArmAngle: 164,
        hipShoulderSeparation: 46,
        frontKneeBracing: 178,
        leadArmAngleRating: "Optimal",
        frontKneeBracingRating: "Firm Brace",
        hipShoulderSeparationRating: "Elite X-Factor"
      },
      swingFlaws: [
        {
          type: "None",
          detected: false,
          severity: "None",
          description: "No mechanical or kinetic chain flaws detected. Swing path is highly efficient."
        }
      ],
      scoutReport: {
        swingEfficiency: 98,
        summary: "This is a textbook MLB-level power swing. Rotational sequencing is immaculate—the pelvis decelerates sharply right before torso acceleration peaks. Lead-leg bracing force is exceptional, creating an instant whip effect in the hands. Attack angle is in the golden bracket for high-exit velocity home runs.",
        drills: [
          {
            name: "High tee wood-bat training",
            instructions: "Maintain this connection by hitting off a high tee at the top of the strike zone, ensuring the barrel stays above the ball until launch, forcing the hands to remain tight."
          }
        ],
        squaredUpRate: 96,
        contactDepth: "Optimal"
      }
    },
    statcast: {
      exitVelocity: 114.2,
      launchAngle: 26.4,
      distance: 448,
      attackAngle: 14.2,
      verticalBatAngle: -38.5
    }
  },
  {
    id: "opposite-field-contact",
    name: "Opposite Field Line-Drive Swing",
    type: "Pro Contact",
    description: "Inspired by Luis Arraez. Flat, direct barrel path with a late contact point. Showcases how a compact hand path and tight rotational core excel in hitting velocity to all fields.",
    videoUrl: "",
    analysis: {
      phases: [
        {
          phase: "Stance/Load",
          timestamp: 0.15,
          frame: 18,
          description: "Quiet, balanced setup. Hands set lower to guarantee a shorter travel path. Minimal stride loading to keep head completely still."
        },
        {
          phase: "Toe-Touch",
          timestamp: 0.45,
          frame: 54,
          description: "Front foot lands very early and soft. Rotational mechanics are tight; hip-shoulder separation is controlled at 36° to focus on timing and contact direction."
        },
        {
          phase: "Launch/Contact",
          timestamp: 0.60,
          frame: 72,
          description: "Contact is made slightly deeper in the zone (closer to the plate). Lead arm shows slight athletic flexion at 152°, while the front knee braces strongly at 171°."
        },
        {
          phase: "Follow-Through",
          timestamp: 0.95,
          frame: 114,
          description: "Controlled, two-handed finish below the shoulder, ensuring a flat line-drive extension trajectory through the ball."
        }
      ],
      biomechanics: {
        leadArmAngle: 152,
        hipShoulderSeparation: 36,
        frontKneeBracing: 171,
        leadArmAngleRating: "Optimal",
        frontKneeBracingRating: "Firm Brace",
        hipShoulderSeparationRating: "Optimal"
      },
      swingFlaws: [
        {
          type: "None",
          detected: false,
          severity: "None",
          description: "No flaws. Highly efficient compact contact path."
        }
      ],
      scoutReport: {
        swingEfficiency: 94,
        summary: "Excellent short-to-long-through swing profile. By letting the ball travel deeper, the hitter maintains a flatter, highly stable barrel path. Highly effective for high contact rates and spraying line drives. Biomechanical bracing is sturdy and limits energy leakage.",
        drills: [
          {
            name: "Inside-Out Tee Placements",
            instructions: "Place a tee on the outer edge of the plate, slightly deep. Practice driving inside-out line drives into the opposite field gap without rolling the wrists."
          }
        ],
        squaredUpRate: 98,
        contactDepth: "Optimal"
      }
    },
    statcast: {
      exitVelocity: 101.5,
      launchAngle: 14.8,
      distance: 312,
      attackAngle: 6.5,
      verticalBatAngle: -27.0
    }
  },
  {
    id: "amateur-casting-flaw",
    name: "Developing Player (Casting & Looping)",
    type: "Amateur (Flawed)",
    description: "Typical high-school / amateur pattern. Displays premature arm extension (Casting) and trailing-side shoulder collapse (Dropping the Barrel), leading to pop-ups and contact out-of-front.",
    videoUrl: "",
    analysis: {
      phases: [
        {
          phase: "Stance/Load",
          timestamp: 0.25,
          frame: 30,
          description: "Hands are low and wrapped behind the head. Front foot lifts high but weight distribution slides too far back, leading to a lunging forward motion."
        },
        {
          phase: "Toe-Touch",
          timestamp: 0.62,
          frame: 74,
          description: "Toe touch occurs with early hand leakage. Instead of keeping the hands loaded, they start pushing forward, dropping the X-Factor separation to a weak 24°."
        },
        {
          phase: "Launch/Contact",
          timestamp: 0.82,
          frame: 98,
          description: "Impact. The lead arm is fully locked straight (178° barred) prematurely. Front knee is soft and collapsing at 151°, causing hip rotation to spin out instead of pivot."
        },
        {
          phase: "Follow-Through",
          timestamp: 1.30,
          frame: 156,
          description: "Unbalanced follow-through, falling off to the third-base side with weight dragging backward on the heels."
        }
      ],
      biomechanics: {
        leadArmAngle: 178,
        hipShoulderSeparation: 24,
        frontKneeBracing: 151,
        leadArmAngleRating: "Casting Detected",
        frontKneeBracingRating: "Soft Knee/Leaking Energy",
        hipShoulderSeparationRating: "Under-rotated"
      },
      swingFlaws: [
        {
          type: "Casting",
          detected: true,
          severity: "High",
          description: "The hands cast away from the chest plane immediately during initiation, creating a long, slow outer loop that makes it difficult to hit high velocity."
        },
        {
          type: "Dropping the Barrel",
          detected: true,
          severity: "Medium",
          description: "The rear shoulder collapses early during the stride, dropping the bat barrel beneath the pitch plane and forcing an extreme upward swing slope."
        }
      ],
      scoutReport: {
        swingEfficiency: 68,
        summary: "Mechanical efficiency is severely compromised by casting and premature backside collapse. The 'soft' lead knee leaks linear energy rather than snapping the rotation shut. This results in slow bat speed, lunging contact, and a looping upward plane (+22° Attack Angle) susceptible to high fastballs.",
        drills: [
          {
            name: "Alligator Arms Tee Drill",
            instructions: "Squeeze a tennis ball or towel under your lead armpit while taking swings. This prevents early extension, forcing the hands to pull direct and tight through the ball."
          },
          {
            name: "Top Hand / Bottom Hand Isolation Drills",
            instructions: "Perform single-arm swings with a choked-up bat. Focus on lead-arm pulling direct and rear-arm driving palm-up without dropping the rear elbow."
          }
        ],
        squaredUpRate: 64,
        contactDepth: "Too Far Out"
      }
    },
    statcast: {
      exitVelocity: 82.8,
      launchAngle: 25.1,
      distance: 245,
      attackAngle: 21.8,
      verticalBatAngle: -46.2
    }
  }
];
