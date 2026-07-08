import { PreloadedSwing } from "./types";

export const PRELOADED_SWINGS: PreloadedSwing[] = [
  {
    id: "infield-gunner",
    name: "Infield Gunner (Shortstop to 1B)",
    type: "Infield Gunner",
    description: "Inspired by Elly De La Cruz. Features an explosive, ultra-quick hand transfer, high hip-shoulder separation, and a rigid, high-force lead foot brace that converts linear momentum into a 97.8 MPH bullet across the diamond.",
    videoUrl: "", // Handled by visual canvas simulator
    analysis: {
      phases: [
        {
          phase: "Load/Cocking",
          timestamp: 0.20,
          frame: 24,
          description: "Infielder loads the ball out of the glove. Hand separation is rapid and tight. Weight is loaded 65% onto the rear leg as the shoulder axis counter-rotates slightly."
        },
        {
          phase: "Foot Plant",
          timestamp: 0.55,
          frame: 66,
          description: "Lead stride foot plants firmly. Hips begin their aggressive opening rotation while upper body shoulders hold back, building an elite 46° of torque stretch (X-Factor separation)."
        },
        {
          phase: "Release Point",
          timestamp: 0.72,
          frame: 86,
          description: "Ball release. Elbow is flexed at an optimal 104° for safe, high-leverage whip. The lead leg is rigidly straight (178° brace), completely stopping forward linear speed to transfer force."
        },
        {
          phase: "Follow-Through",
          timestamp: 1.15,
          frame: 138,
          description: "Dynamic deceleration. Rear leg swings forward in a balanced arc. The throwing arm decelerates cleanly across the body, protecting the rotator cuff."
        }
      ],
      biomechanics: {
        leadArmAngle: 104, // Elbow angle
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
          description: "No throwing path or kinetic chain flaws detected. Arm path is highly efficient."
        }
      ],
      scoutReport: {
        swingEfficiency: 98, // Arm efficiency
        summary: "This is a textbook MLB-level infielder throw. Rotational sequencing is immaculate—the pelvis decelerates sharply right before torso acceleration peaks. Lead-leg bracing force is exceptional, creating an instant whip effect in the forearm. Throwing elbow is elevated well above the shoulder plane, protecting the UCL.",
        drills: [
          {
            name: "Target Board Rapid Fire",
            instructions: "Focus on glove-to-hand transition speed by throwing to a 10-foot target from 50 feet. Work on maintaining a short, compact arm path out of the glove without letting the ball dip below the waist."
          }
        ],
        squaredUpRate: 96,
        contactDepth: "Optimal"
      }
    },
    statcast: {
      exitVelocity: 97.8, // Throw velocity
      launchAngle: 8.5,  // Release angle
      distance: 135,     // Carry distance
      attackAngle: 104,  // Elbow extension/flexion
      verticalBatAngle: -35.2 // Release slot angle
    }
  },
  {
    id: "outfield-cannon",
    name: "Outfield Cannon (LF to 3B)",
    type: "Outfield Cannon",
    description: "Inspired by Ronald Acuña Jr. Explodes out of a hard crow-hop step, creating exceptional linear momentum. Showcases how maximum shoulder-to-hip torque and high overhand release create a 101.5 MPH carry that travels 285 feet with perfect accuracy.",
    videoUrl: "",
    analysis: {
      phases: [
        {
          phase: "Load/Cocking",
          timestamp: 0.15,
          frame: 18,
          description: "Crow-hop drive off the turf. The body stores immense horizontal energy. Throwing arm draws back into a long, powerful scapular loading position."
        },
        {
          phase: "Foot Plant",
          timestamp: 0.45,
          frame: 54,
          description: "Front heel plants hard into the grass. Pelvis is violently driven open, but the chest remains closed at a 38° angle, setting up massive elastic energy."
        },
        {
          phase: "Release Point",
          timestamp: 0.60,
          frame: 72,
          description: "High-angle overhand release. Elbow angle is open to 112° to leverage the longer arm path. Front knee braces firmly at 171° to launch the upper body forward."
        },
        {
          phase: "Follow-Through",
          timestamp: 0.95,
          frame: 114,
          description: "Long follow-through over a bent back. Back leg drives high, helping the body decelerate naturally through a long, safe decelerating path."
        }
      ],
      biomechanics: {
        leadArmAngle: 112,
        hipShoulderSeparation: 38,
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
          description: "No arm action flaws. Outstanding high-output outfield throw mechanics."
        }
      ],
      scoutReport: {
        swingEfficiency: 94,
        summary: "Excellent outfield crow-hop throw profile. By leveraging a high release angle and maximizing backspin, this fielder achieves a highly stable, low-drag flight path. High overhand slot prevents tailing. Kinetic chain transfer is robust and limits stress on the shoulder joint.",
        drills: [
          {
            name: "Outfield Long-Toss Routine",
            instructions: "Perform progressive distance long-toss up to 180-220 feet. Focus on launching the ball on a high-arc path with pure backspin to let the ball carry naturally on its seams."
          }
        ],
        squaredUpRate: 98,
        contactDepth: "Optimal"
      }
    },
    statcast: {
      exitVelocity: 101.5,
      launchAngle: 18.2,
      distance: 285,
      attackAngle: 112,
      verticalBatAngle: -27.0
    }
  },
  {
    id: "amateur-elbow-drag",
    name: "Developing Player (Elbow Drag Flaw)",
    type: "Amateur (Flawed)",
    description: "Typical amateur throw. Displays dropping of the elbow below the shoulder line (Elbow Drag) and premature open front side (Flying Open), causing the arm to push sidearm. This results in poor carry and sails wild.",
    videoUrl: "",
    analysis: {
      phases: [
        {
          phase: "Load/Cocking",
          timestamp: 0.25,
          frame: 30,
          description: "Slow glove transfer. Hands separate early, but the ball is dragged behind the back with a low, flat elbow path."
        },
        {
          phase: "Foot Plant",
          timestamp: 0.62,
          frame: 74,
          description: "Lead foot lands with the front shoulder already blown open. Stride hip is pre-rotated, stripping the pelvis-to-shoulder stretch to a weak 24°."
        },
        {
          phase: "Release Point",
          timestamp: 0.82,
          frame: 98,
          description: "Release. The elbow is dragged down to a weak 148° and sits below the shoulder axis. Front knee is soft and collapsing at 151°, causing the thrower's hips to spin out."
        },
        {
          phase: "Follow-Through",
          timestamp: 1.30,
          frame: 156,
          description: "Poor deceleration. Fielder falls off-balance to the left side, causing excessive strain on the shoulder rotator cuffs."
        }
      ],
      biomechanics: {
        leadArmAngle: 148, // Dropped sidearm elbow extension
        hipShoulderSeparation: 24,
        frontKneeBracing: 151,
        leadArmAngleRating: "Elbow Drag Detected",
        frontKneeBracingRating: "Soft Knee/Leaking Energy",
        hipShoulderSeparationRating: "Under-rotated"
      },
      swingFlaws: [
        {
          type: "Elbow Drag",
          detected: true,
          severity: "High",
          description: "The elbow drags below the shoulder plane during cocking, causing extreme sidearm strain and converting a whipping arm action into a pushed, weak delivery."
        },
        {
          type: "Flying Open",
          detected: true,
          severity: "Medium",
          description: "The front glove side pulls away early before foot plant, opening the chest axis too early. This leaks torque and forces the arm to work independently of the core."
        }
      ],
      scoutReport: {
        swingEfficiency: 68,
        summary: "Throwing efficiency is severely compromised by elbow drag and a prematurely opened front side. The 'soft' lead knee collapses on plant, leaking forward linear power rather than snapping the rotation shut. This results in a low 74.2 MPH throw that floats or sails.",
        drills: [
          {
            name: "L-Screen Arm Height Drill",
            instructions: "Stand adjacent to an L-screen with your throwing arm side aligned. Focus on keeping your elbow up above the horizontal screen line during cocking and release to build an overhand slot."
          },
          {
            name: "Figure-8 Rotation Holds",
            instructions: "Use a weighted ball or sock. Rock back and forth in a figure-8 motion, keeping the front shoulder closed until the front heel firmly touches the turf to preserve core torque."
          }
        ],
        squaredUpRate: 64,
        contactDepth: "Leaked"
      }
    },
    statcast: {
      exitVelocity: 74.2,
      launchAngle: 14.2,
      distance: 95,
      attackAngle: 148,
      verticalBatAngle: -48.5
    }
  }
];
