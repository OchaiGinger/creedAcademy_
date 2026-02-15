"use server";

import { ASSESSMENT_QUESTIONS } from "@/constants/questions";
import { env } from "@/lib/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = env.GEMINI_API_KEY; // Ensure this matches your .env name

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

// 1. Correct Initialization
const genAI = new GoogleGenerativeAI(apiKey);

export async function evaluateAssessment(answers: Record<number, string>) {
  try {
    // 2. Correct Model Access
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Construct a professional prompt to ensure valid JSON output
    const prompt = `
      You are an expert career counselor at Keek Institute. 
      Based on the following student assessment answers: ${JSON.stringify(answers)}
      
      Compare these against the following question context: ${JSON.stringify(ASSESSMENT_QUESTIONS)}

      Provide a career path recommendation in STRICT JSON format. 
      Return ONLY the JSON object with these keys:
      {
        "recommendedPath": "frontend" | "backend" | "fullstack" | "data_science" | "devops",
        "score": number (0-100),
        "feedback": "A detailed 2-sentence explanation of why this path fits them",
        "status": "PASSED"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response (sometimes AI wraps JSON in ```json blocks)
    const cleanedText = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    // Return a safe fallback so the user can still finish onboarding if the AI fails
    return {
      recommendedPath: "fullstack",
      score: 100,
      feedback:
        "You show great potential across the board! We recommend the Full-stack path to start.",
      status: "PASSED",
    };
  }
}
