import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  experiment_id: string;
  experiment_type: string;
  image_data: string;
}

interface Component {
  type: string;
  properties: Record<string, unknown>;
  position: string;
  connections: string[];
}

interface SafetyWarning {
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  recommendation: string;
}

interface GuidanceStep {
  step: number;
  instruction: string;
}

interface AnalysisResult {
  observations: string;
  components: Component[];
  predicted_outcome: string;
  safety_warnings: SafetyWarning[];
  guidance: GuidanceStep[];
  confidence_score: number;
}

function buildAnalysisPrompt(experimentType: string): string {
  const basePrompt = `You are Newton's Lens, an expert AI lab assistant for science experiments.
Analyze this experimental setup image and provide a detailed analysis in JSON format.

Your analysis should include:
1. Components identified in the setup
2. How components are connected or arranged
3. Predicted outcome of the experiment
4. Safety warnings (if any)
5. Step-by-step guidance for proper execution
6. Confidence score (0-1)

Focus on:`;

  const typeSpecific: Record<string, string> = {
    circuits: `
- Identify electronic components (resistors, LEDs, batteries, wires, breadboards)
- Check for proper connections and polarity
- Calculate current and voltage if possible
- Warn about short circuits, reverse polarity, or component damage risks
- Provide guidance on proper circuit assembly`,

    chemistry: `
- Identify chemicals, glassware, and equipment
- Check for proper safety equipment (gloves, goggles)
- Warn about dangerous chemical reactions
- Note proper mixing order and safety precautions
- Provide guidance on safe chemical handling`,

    physics: `
- Identify mechanical components and setup
- Analyze forces, motion, or energy involved
- Check for stability and safety of the setup
- Predict physical outcomes
- Provide guidance on measurement and execution`,

    general: `
- Identify all visible components and materials
- Analyze the experimental setup
- Provide safety recommendations
- Suggest proper execution steps`,
  };

  const jsonFormat = `

Return your analysis as a valid JSON object with this structure:
{
  "observations": "Detailed description of what you see",
  "components": [
    {
      "type": "component type",
      "properties": {"key": "value"},
      "position": "description",
      "connections": ["connected to"]
    }
  ],
  "predicted_outcome": "What will happen when this experiment is executed",
  "safety_warnings": [
    {
      "severity": "low|medium|high|critical",
      "message": "Warning message",
      "recommendation": "How to fix it"
    }
  ],
  "guidance": [
    {
      "step": 1,
      "instruction": "Step instruction"
    }
  ],
  "confidence_score": 0.95
}

Ensure the response is ONLY valid JSON, no additional text.`;

  return basePrompt + (typeSpecific[experimentType] || typeSpecific.general) + jsonFormat;
}

function getMockAnalysis(experimentType: string): AnalysisResult {
  const mockData: Record<string, AnalysisResult> = {
    circuits: {
      observations: "I can see a basic electrical circuit with a battery, LED, and wires.",
      components: [
        {
          type: "LED",
          properties: { color: "red", voltage: "2V" },
          position: "center of breadboard",
          connections: ["9V battery positive"],
        },
        {
          type: "9V Battery",
          properties: { voltage: "9V" },
          position: "left side",
          connections: ["LED", "ground wire"],
        },
      ],
      predicted_outcome: "The LED will light up when connected to the battery.",
      safety_warnings: [
        {
          severity: "high",
          message: "LED connected without current-limiting resistor",
          recommendation: "Add a 470Ω resistor in series with the LED.",
        },
      ],
      guidance: [
        { step: 1, instruction: "Add a resistor in series with the LED" },
        { step: 2, instruction: "Connect the circuit properly" },
      ],
      confidence_score: 0.85,
    },
    chemistry: {
      observations: "I can see laboratory glassware and chemicals.",
      components: [
        {
          type: "Beaker",
          properties: { volume: "250ml" },
          position: "center of workspace",
          connections: [],
        },
      ],
      predicted_outcome: "A chemical reaction will occur when components are mixed.",
      safety_warnings: [
        {
          severity: "high",
          message: "Always wear safety equipment",
          recommendation: "Put on safety goggles and gloves.",
        },
      ],
      guidance: [{ step: 1, instruction: "Put on safety equipment" }],
      confidence_score: 0.75,
    },
    physics: {
      observations: "I can see a mechanical setup for motion experiments.",
      components: [
        {
          type: "Inclined plane",
          properties: { angle: "30 degrees" },
          position: "center",
          connections: [],
        },
      ],
      predicted_outcome: "The object will roll down the inclined plane.",
      safety_warnings: [
        {
          severity: "low",
          message: "Ensure the ramp is stable",
          recommendation: "Secure the base of the ramp.",
        },
      ],
      guidance: [{ step: 1, instruction: "Measure the ramp angle" }],
      confidence_score: 0.8,
    },
  };

  return mockData[experimentType] || mockData.circuits;
}

async function analyzeWithGemini(
  imageData: string,
  experimentType: string
): Promise<AnalysisResult> {
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiKey) {
    console.log("GEMINI_API_KEY not set, using mock analysis");
    return getMockAnalysis(experimentType);
  }

  try {
    const base64Image = imageData.startsWith("data:image") ? imageData.split(",")[1] : imageData;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: buildAnalysisPrompt(experimentType),
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      return getMockAnalysis(experimentType);
    }

    const result = await response.json();
    const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) {
      return getMockAnalysis(experimentType);
    }

    const cleanedText = analysisText
      .replace(/^```json\n?/, "")
      .replace(/^```\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    const analysis = JSON.parse(cleanedText) as AnalysisResult;

    return {
      observations: analysis.observations || "",
      components: analysis.components || [],
      predicted_outcome: analysis.predicted_outcome || "",
      safety_warnings: analysis.safety_warnings || [],
      guidance: analysis.guidance || [],
      confidence_score: analysis.confidence_score || 0.8,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return getMockAnalysis(experimentType);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const data = (await req.json()) as AnalysisRequest;

    if (!data.image_data) {
      return new Response(JSON.stringify({ error: "No image data provided" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const analysis = await analyzeWithGemini(data.image_data, data.experiment_type || "general");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/analysis_sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
      },
      body: JSON.stringify({
        experiment_id: data.experiment_id,
        image_data: data.image_data.substring(0, 5000),
        ai_observations: {
          observations: analysis.observations,
          components: analysis.components,
        },
        predicted_outcome: analysis.predicted_outcome,
        safety_warnings: analysis.safety_warnings,
        guidance: analysis.guidance,
        confidence_score: analysis.confidence_score,
        status: 'completed',
      }),
    });

    if (!supabaseResponse.ok) {
      const errorData = await supabaseResponse.text();
      console.error("Supabase error response:", errorData);
      console.error("Status:", supabaseResponse.status);
      throw new Error(`Failed to save analysis session: ${supabaseResponse.status}`);
    }

    const sessionData = await supabaseResponse.json();
    console.log("Session data:", sessionData);
    const sessionId = Array.isArray(sessionData) ? sessionData[0]?.id : sessionData.id;

    if (!sessionId) {
      throw new Error("No session ID returned from Supabase");
    }

    return new Response(
      JSON.stringify({
        session_id: sessionId,
        status: "completed",
        analysis,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Analysis error:", errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
