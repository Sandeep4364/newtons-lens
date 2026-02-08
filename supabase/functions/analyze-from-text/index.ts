import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TextAnalysisRequest {
  experiment_id: string;
  experiment_type: string;
  components: string[];
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

function buildTextAnalysisPrompt(components: string[], experimentType: string): string {
  const basePrompt = `You are Newton's Lens, an expert AI lab assistant for science experiments.

The user has provided these components for a ${experimentType} experiment:
${components.join(', ')}

Analyze this component list and provide a detailed analysis in JSON format.

Your analysis should include:
1. What experiment they're likely setting up based on these components
2. How these components should be connected or arranged
3. Predicted outcome of the experiment
4. Safety warnings (especially if any components are missing or dangerous combinations exist)
5. Step-by-step assembly guidance
6. Confidence score (0-1)

Focus on:`;

  const typeSpecific: Record<string, string> = {
    circuits: `
- Analyze the electronic components provided
- Check if proper connections can be made with these components
- Identify missing critical components (e.g., resistors for LEDs)
- Warn about short circuits, reverse polarity, or component damage risks
- Provide step-by-step circuit assembly instructions
- Calculate expected current and voltage if possible`,

    chemistry: `
- Identify the chemicals and equipment provided
- Check for missing safety equipment (gloves, goggles)
- Warn about dangerous chemical reactions or missing safety gear
- Note proper mixing order and safety precautions
- Provide guidance on safe chemical handling and procedure`,

    physics: `
- Identify the mechanical components and measurement tools
- Analyze the type of physics experiment (motion, forces, energy, etc.)
- Check for stability and safety of the potential setup
- Predict physical outcomes
- Provide guidance on measurement techniques and execution`,

    general: `
- Identify all components and their likely purpose
- Analyze the potential experimental setup
- Provide safety recommendations
- Suggest proper execution steps`,
  };

  const jsonFormat = `

Return your analysis as a valid JSON object with this structure:
{
  "observations": "Detailed analysis of the component list and likely experiment setup",
  "components": [
    {
      "type": "component name from the list",
      "properties": {"relevant": "properties"},
      "position": "suggested position or role in setup",
      "connections": ["what this connects to"]
    }
  ],
  "predicted_outcome": "What will happen when this experiment is executed",
  "safety_warnings": [
    {
      "severity": "low|medium|high|critical",
      "message": "Warning message",
      "recommendation": "How to fix it or what to add"
    }
  ],
  "guidance": [
    {
      "step": 1,
      "instruction": "Step-by-step instruction"
    }
  ],
  "confidence_score": 0.85
}

Ensure the response is ONLY valid JSON, no additional text.`;

  return basePrompt + (typeSpecific[experimentType] || typeSpecific.general) + jsonFormat;
}

function getMockAnalysis(components: string[], experimentType: string): AnalysisResult {
  const componentsList = components.map((c, idx) => ({
    type: c,
    properties: {},
    position: `Component ${idx + 1}`,
    connections: [],
  }));

  const mockData: Record<string, Partial<AnalysisResult>> = {
    circuits: {
      observations: `I can see you have these components: ${components.join(', ')}. This looks like a basic electrical circuit setup.`,
      predicted_outcome: "The circuit will function when properly connected.",
      safety_warnings: [
        {
          severity: "medium",
          message: "Ensure proper component ratings",
          recommendation: "Check voltage and current ratings before connecting.",
        },
      ],
      guidance: [
        { step: 1, instruction: "Layout components on the breadboard" },
        { step: 2, instruction: "Make connections following the circuit diagram" },
        { step: 3, instruction: "Test with a multimeter before powering on" },
      ],
    },
    chemistry: {
      observations: `I can see you have these components: ${components.join(', ')}. Please ensure you have proper safety equipment.`,
      predicted_outcome: "A chemical reaction will occur when components are properly mixed.",
      safety_warnings: [
        {
          severity: "high",
          message: "Always wear safety equipment",
          recommendation: "Put on safety goggles and gloves before starting.",
        },
      ],
      guidance: [
        { step: 1, instruction: "Put on all safety equipment" },
        { step: 2, instruction: "Prepare the workspace in a ventilated area" },
        { step: 3, instruction: "Follow proper mixing procedures" },
      ],
    },
    physics: {
      observations: `I can see you have these components: ${components.join(', ')}. This appears to be a mechanics experiment.`,
      predicted_outcome: "The experiment will demonstrate physical principles of motion or forces.",
      safety_warnings: [
        {
          severity: "low",
          message: "Ensure stable setup",
          recommendation: "Secure all components before starting the experiment.",
        },
      ],
      guidance: [
        { step: 1, instruction: "Set up the apparatus on a stable surface" },
        { step: 2, instruction: "Calibrate measurement instruments" },
        { step: 3, instruction: "Take measurements carefully" },
      ],
    },
  };

  const baseData = mockData[experimentType] || mockData.circuits;

  return {
    observations: baseData.observations || `Components provided: ${components.join(', ')}`,
    components: componentsList,
    predicted_outcome: baseData.predicted_outcome || "The experiment will proceed as planned.",
    safety_warnings: baseData.safety_warnings || [],
    guidance: baseData.guidance || [],
    confidence_score: 0.75,
  };
}

async function analyzeWithGemini(
  components: string[],
  experimentType: string
): Promise<AnalysisResult> {
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiKey) {
    console.log("GEMINI_API_KEY not set, using mock analysis");
    return getMockAnalysis(components, experimentType);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: buildTextAnalysisPrompt(components, experimentType),
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      return getMockAnalysis(components, experimentType);
    }

    const result = await response.json();
    const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) {
      return getMockAnalysis(components, experimentType);
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
    return getMockAnalysis(components, experimentType);
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
    const data = (await req.json()) as TextAnalysisRequest;

    if (!data.components || data.components.length === 0) {
      return new Response(JSON.stringify({ error: "No components provided" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const analysis = await analyzeWithGemini(data.components, data.experiment_type || "general");

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
        analysis_result: analysis,
        image_data: '',  // No image for text-based analysis
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
