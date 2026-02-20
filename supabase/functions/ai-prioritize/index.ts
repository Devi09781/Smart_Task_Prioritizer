import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  estimated_minutes: number;
  category: string;
  status: string;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tasks, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "prioritize") {
      systemPrompt = `You are an AI productivity assistant that helps prioritize tasks. 
Analyze tasks based on:
1. Deadline urgency (40% weight) - closer deadlines = higher priority
2. Task importance based on category (30% weight) - work > study > health > personal > other
3. Estimated effort (20% weight) - balance workload
4. Current status (10% weight) - in_progress tasks get slight boost

Return a JSON object with task IDs mapped to priority scores (0.0 to 1.0).
Only return valid JSON, no explanations.`;

      userPrompt = `Analyze and prioritize these tasks:
${JSON.stringify(tasks, null, 2)}

Current time: ${new Date().toISOString()}

Return format: {"task_id": priority_score, ...}`;
    } else if (type === "suggest") {
      systemPrompt = `You are an AI productivity assistant. Based on the user's current tasks and patterns, suggest 3-5 actionable tasks they might want to add. Be specific and practical.`;
      
      userPrompt = `Current tasks:
${JSON.stringify(tasks, null, 2)}

Suggest new tasks that would complement their workload. Return as JSON array with objects containing: title, priority (low/medium/high), category (work/personal/study/health/other).`;
    }

    const body: Record<string, unknown> = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    };

    if (type === "prioritize") {
      body.tools = [
        {
          type: "function",
          function: {
            name: "set_task_priorities",
            description: "Set priority scores for tasks",
            parameters: {
              type: "object",
              properties: {
                priorities: {
                  type: "object",
                  additionalProperties: {
                    type: "number",
                    minimum: 0,
                    maximum: 1
                  },
                  description: "Object mapping task IDs to priority scores (0.0 to 1.0)"
                }
              },
              required: ["priorities"],
              additionalProperties: false
            }
          }
        }
      ];
      body.tool_choice = { type: "function", function: { name: "set_task_priorities" } };
    } else if (type === "suggest") {
      body.tools = [
        {
          type: "function",
          function: {
            name: "suggest_tasks",
            description: "Return 3-5 actionable task suggestions",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      priority: { type: "string", enum: ["low", "medium", "high"] },
                      category: { type: "string" }
                    },
                    required: ["title", "priority", "category"],
                    additionalProperties: false
                  }
                }
              },
              required: ["suggestions"],
              additionalProperties: false
            }
          }
        }
      ];
      body.tool_choice = { type: "function", function: { name: "suggest_tasks" } };
    }

    console.log("Calling AI gateway with type:", type);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI response received:", JSON.stringify(aiResponse));

    let result: unknown;
    
    if (aiResponse.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      const args = JSON.parse(aiResponse.choices[0].message.tool_calls[0].function.arguments);
      result = type === "prioritize" ? args.priorities : args.suggestions;
    } else if (aiResponse.choices?.[0]?.message?.content) {
      // Fallback to parsing content
      const content = aiResponse.choices[0].message.content;
      result = JSON.parse(content);
    } else {
      throw new Error("Unexpected AI response format");
    }

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-prioritize function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
