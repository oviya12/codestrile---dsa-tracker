import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Goal, ImpactAnalysis, UserState } from "../types";

export const analyzeMissedTarget = async (
  reason: string,
  missedCount: number,
  state: UserState
): Promise<ImpactAnalysis> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  const shortTermGoal = state.goals.find(g => g.type === 'SHORT_TERM');
  const longTermGoal = state.goals.find(g => g.type === 'LONG_TERM');

  const prompt = `
    The user has missed their daily coding target.
    
    --- DAILY STATUS ---
    Daily Target: ${state.dailyTarget} problems
    Actually Solved Today: ${state.dailyTarget - missedCount} problems (Combined LeetCode + Manual entries)
    Deficit: ${missedCount} problems
    Reason provided: "${reason}"
    Current Streak: ${state.streak} days

    --- GOALS STATUS ---
    1. Short Term Goal: ${shortTermGoal?.description || 'N/A'}
       - Progress: ${shortTermGoal?.progress || 0} / ${shortTermGoal?.targetCount || 0} problems
       - Deadline: ${shortTermGoal?.deadline || 'N/A'}
       
    2. Long Term Goal: ${longTermGoal?.description || 'N/A'}
       - Progress: ${longTermGoal?.progress || 0} / ${longTermGoal?.targetCount || 0} problems
       - Deadline: ${longTermGoal?.deadline || 'N/A'}

    --- REQUEST ---
    Analyze the specific impact of missing today's target on BOTH goals.
    1. How does this deficit affect the Short Term goal deadline?
    2. How does the compound effect impact the Long Term goal of cracking the interview (requiring ${longTermGoal?.targetCount || 0} problems)?
    
    Provide a JSON response with:
    - riskLevel: LOW/MEDIUM/HIGH/CRITICAL
    - impactDescription: A concise paragraph (approx 50-70 words) specifically explaining the delay or negative impact on BOTH the short-term and long-term timelines if this behavior persists. Mention the goals by name.
    - adjustedPlan: A concrete strategy to catch up (e.g., "Add 1 extra problem for the next ${missedCount * 2} days").
    - motivationalMessage: A short, punchy quote or advice to reset their mindset.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
      impactDescription: { type: Type.STRING },
      adjustedPlan: { type: Type.STRING },
      motivationalMessage: { type: Type.STRING },
    },
    required: ["riskLevel", "impactDescription", "adjustedPlan", "motivationalMessage"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from Gemini");
    }
    return JSON.parse(text) as ImpactAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Failed", error);
    return {
      riskLevel: 'MEDIUM',
      impactDescription: 'Unable to analyze precise impact due to connection error. However, missing daily targets will delay your Short Term goal completion.',
      adjustedPlan: 'Try to solve +1 problem tomorrow to make up for it.',
      motivationalMessage: 'Keep going, consistency is key!',
    };
  }
};