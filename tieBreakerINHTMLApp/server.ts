import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize GoogleGenAI to handle missing API key gracefully on startup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Decision analysis schema definitions
const prosConsSchema = {
  type: Type.OBJECT,
  properties: {
    decisionTitle: { type: Type.STRING },
    pros: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Short name of the advantage" },
          description: { type: Type.STRING, description: "Detailed explanation of why this is a positive factor" },
          weight: { type: Type.INTEGER, description: "Weight of importance, 1 (low) to 5 (high)" }
        },
        required: ["title", "description", "weight"]
      }
    },
    cons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Short name of the disadvantage" },
          description: { type: Type.STRING, description: "Detailed explanation of why this is a negative factor" },
          weight: { type: Type.INTEGER, description: "Weight of importance, 1 (low) to 5 (high)" }
        },
        required: ["title", "description", "weight"]
      }
    },
    tiebreakerVerdict: { type: Type.STRING, description: "A highly clear, decisive, and empathetic tiebreaking recommendation based on the pros and cons." }
  },
  required: ["decisionTitle", "pros", "cons", "tiebreakerVerdict"]
};

const comparisonSchema = {
  type: Type.OBJECT,
  properties: {
    decisionTitle: { type: Type.STRING },
    criteria: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique short alphanumeric identifier, e.g. 'cost'" },
          name: { type: Type.STRING, description: "The display name of the criterion, e.g. 'Cost & Value'" },
          description: { type: Type.STRING, description: "Brief definition of what this criterion evaluates" }
        },
        required: ["id", "name", "description"]
      }
    },
    options: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The name of the option" },
          scores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                criterionId: { type: Type.STRING, description: "Matching id from the criteria list" },
                score: { type: Type.INTEGER, description: "Score for this option under this criterion, 1 (poor) to 5 (excellent)" },
                note: { type: Type.STRING, description: "Short justifying explanation for the assigned score" }
              },
              required: ["criterionId", "score", "note"]
            }
          }
        },
        required: ["name", "scores"]
      }
    },
    tiebreakerVerdict: { type: Type.STRING, description: "A detailed comparison review ending with a clear tiebreaking choice recommendation." }
  },
  required: ["decisionTitle", "criteria", "options", "tiebreakerVerdict"]
};

const swotSchema = {
  type: Type.OBJECT,
  properties: {
    decisionTitle: { type: Type.STRING },
    strengths: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Short title of the strength" },
          description: { type: Type.STRING, description: "Detailed explanation of this internal advantage" }
        },
        required: ["title", "description"]
      }
    },
    weaknesses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Short title of the weakness" },
          description: { type: Type.STRING, description: "Detailed explanation of this internal limitation" }
        },
        required: ["title", "description"]
      }
    },
    opportunities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Short title of the opportunity" },
          description: { type: Type.STRING, description: "Detailed explanation of this external positive factor" }
        },
        required: ["title", "description"]
      }
    },
    threats: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Short title of the threat" },
          description: { type: Type.STRING, description: "Detailed explanation of this external risk or obstacle" }
        },
        required: ["title", "description"]
      }
    },
    tiebreakerVerdict: { type: Type.STRING, description: "A final strategic tiebreaker recommendation weaving together the SWOT analysis quadrants into a clear direction." }
  },
  required: ["decisionTitle", "strengths", "weaknesses", "opportunities", "threats", "tiebreakerVerdict"]
};

// API Endpoint to request a decision breakdown
app.post("/api/decide", async (req, res) => {
  try {
    const { decisionTitle, analysisType, options, additionalContext } = req.body;

    if (!decisionTitle || typeof decisionTitle !== "string" || decisionTitle.trim() === "") {
      res.status(400).json({ error: "Please provide a valid decision title." });
      return;
    }

    const client = getGeminiClient();
    let prompt = "";
    let schemaToUse: any = null;

    if (analysisType === "pros_cons") {
      schemaToUse = prosConsSchema;
      prompt = `Perform a rigorous, balanced, and objective Pros and Cons analysis for the following decision: "${decisionTitle}".
${additionalContext ? `Additional context or user preferences to keep in mind: "${additionalContext}".` : ""}
Provide a comprehensive set of pros and cons. Weigh each item from 1 (low impact) to 5 (extremely high impact).
Conclude with a clear, definitive, and highly practical 'tiebreakerVerdict' that breaks any hesitation and suggests the best path forward.`;
    } else if (analysisType === "comparison_table") {
      schemaToUse = comparisonSchema;
      const optionsText = (Array.isArray(options) && options.filter(Boolean).length > 0)
        ? `Evaluate these options: ${options.map(o => `"${o}"`).join(", ")}.`
        : `Automatically formulate the 2 to 3 most relevant, distinct, and logical options to compare for this query.`;

      prompt = `Create a comparative decision-making matrix table for the decision: "${decisionTitle}".
${optionsText}
${additionalContext ? `Additional context or user preferences to keep in mind: "${additionalContext}".` : ""}
Determine 3 to 5 logical criteria to evaluate these options. Score each option for each criterion on a scale from 1 (poor) to 5 (excellent) and provide a concise, justifying note.
Conclude with a clear, direct, and empathetic 'tiebreakerVerdict' evaluating the best scoring options and offering a firm choice recommendation.`;
    } else if (analysisType === "swot") {
      schemaToUse = swotSchema;
      prompt = `Perform a comprehensive and strategic SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis for this decision or strategic move: "${decisionTitle}".
${additionalContext ? `Additional context or user preferences to keep in mind: "${additionalContext}".` : ""}
Provide 3 to 5 clear items for each of the four categories:
- Strengths: Internal advantages, capabilities, or assets
- Weaknesses: Internal limitations, gaps, or challenges
- Opportunities: External trends, options, or changes to exploit
- Threats: External risks, competitors, or changing factors to mitigate
Conclude with a powerful 'tiebreakerVerdict' showing how to leverage strengths/opportunities and overcome weaknesses/threats to make a firm decision.`;
    } else {
      res.status(400).json({ error: "Invalid analysisType requested. Choose 'pros_cons', 'comparison_table', or 'swot'." });
      return;
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schemaToUse,
        systemInstruction: "You are 'The Tiebreaker'—an expert strategic advisor and decisive mentor. Your job is to help users overcome analysis paralysis. You analyze scenarios objectively but are always willing to pick a definitive path or offer a very clear recommendation to resolve their dilemma. Never give a generic 'it depends on you' answer; always guide them firmly to the best decision based on the details.",
      },
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Empty response received from the AI model.");
    }

    const parsedData = JSON.parse(textResult.trim());
    res.json({ success: true, data: parsedData });
  } catch (err: any) {
    console.error("Gemini API Error in /api/decide:", err);
    res.status(500).json({
      error: err.message || "An unexpected error occurred while analyzing your decision. Please check your secrets configuration or try again.",
    });
  }
});

// Configure Vite or production static server middleware
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode with static file serving...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Tiebreaker server is active at http://localhost:${PORT}`);
  });
}

setupServer();
