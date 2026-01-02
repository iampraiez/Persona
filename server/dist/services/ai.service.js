"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailyFocus = exports.generateGoalSuggestions = exports.generateGoalSteps = exports.generateEventSuggestions = void 0;
const genai_1 = require("@google/genai");
const logger_utils_1 = require("../utils/logger.utils");
const env_1 = require("../config/env");
const GEMINI_API_KEY = env_1.env.data?.GEMINI_API_KEY;
const genAI = new genai_1.GoogleGenAI({ apiKey: GEMINI_API_KEY || "" });
async function generateContent(prompt) {
    const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return result.text;
}
const cleanJSON = (text) => {
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : null;
};
const generateEventSuggestions = async (events) => {
    if (!GEMINI_API_KEY) {
        logger_utils_1.logger.warn("GEMINI_API_KEY is missing");
        return null;
    }
    if (events.length === 0)
        return null;
    try {
        const eventsText = events
            .map((e) => `Title: ${e.title}, Time: ${formatDateTime(e.startTime)} - ${formatDateTime(e.endTime)}`)
            .join("\n");
        const prompt = `
      Analyze the following schedule and suggest 1-2 improvements for better balance and efficiency.
      Schedule:
      ${eventsText}
      
      Return ONLY a JSON array:
      [{"message": "suggestion text", "type": "schedule"}]
    `;
        const response = await generateContent(prompt);
        return cleanJSON(response);
    }
    catch (error) {
        logger_utils_1.logger.error(`AI Event Suggestion Error: ${error}`);
        return null;
    }
};
exports.generateEventSuggestions = generateEventSuggestions;
const generateGoalSteps = async (goal, totalDays, stepCount, currentSteps) => {
    if (!GEMINI_API_KEY)
        return null;
    try {
        const today = new Date().toISOString().split("T")[0];
        const stepsToGenerate = stepCount || totalDays;
        let prompt = `
      Break down this goal into ${stepsToGenerate} steps over ${totalDays} days starting ${today}.
      Goal: ${goal.title}
      Description: ${goal.description || "N/A"}
    `;
        if (currentSteps && currentSteps.length > 0) {
            const stepsContext = currentSteps
                .filter(s => s.title.trim() !== "")
                .map((s, i) => `${i + 1}. ${s.title} ${s.description ? `(${s.description})` : ""}`)
                .join("\n");
            if (stepsContext) {
                prompt += `
        The user has already defined the following steps:
        ${stepsContext}
        
        Please generate the remaining steps to reach a total of ${stepsToGenerate} steps. 
        If the user's steps are sufficient or match the count, refine them or add necessary missing steps.
        Ensure the output is a complete list of ALL ${stepsToGenerate} steps (including the user's ones if they are good, or improved versions of them).
        `;
            }
        }
        prompt += `
      Return ONLY a JSON array:
      [{
        "title": "Step Title",
        "description": "Step Description",
        "dueDate": "YYYY-MM-DD"
      }]
    `;
        const response = await generateContent(prompt);
        return cleanJSON(response);
    }
    catch (error) {
        logger_utils_1.logger.error(`AI Goal Steps Error: ${error}`);
        return null;
    }
};
exports.generateGoalSteps = generateGoalSteps;
const generateGoalSuggestions = async (goals) => {
    if (!GEMINI_API_KEY || goals.length === 0)
        return null;
    try {
        const goalsText = goals
            .map((g) => {
            const completed = g.steps.filter((s) => s.isCompleted).length;
            return `Goal: ${g.title}, Progress: ${Math.round((completed / g.steps.length) * 100)}%`;
        })
            .join("\n");
        const prompt = `
      Suggest 2-3 actions to progress on these goals.
      Goals:
      ${goalsText}
      
      Return ONLY a JSON array:
      [{"message": "suggestion text", "type": "goal"}]
    `;
        const response = await generateContent(prompt);
        return cleanJSON(response);
    }
    catch (error) {
        logger_utils_1.logger.error(`AI Goal Suggestion Error: ${error}`);
        return null;
    }
};
exports.generateGoalSuggestions = generateGoalSuggestions;
const generateDailyFocus = async (events, goals) => {
    if (!GEMINI_API_KEY)
        return null;
    try {
        const prompt = `
      Suggest 3-5 focus areas for today based on schedule and goals.
      Schedule: ${events.length} events
      Goals: ${goals.length} active goals
      
      Return ONLY a JSON array:
      [{"message": "focus text", "type": "focus"}]
    `;
        const response = await generateContent(prompt);
        return cleanJSON(response);
    }
    catch (error) {
        logger_utils_1.logger.error(`AI Daily Focus Error: ${error}`);
        return null;
    }
};
exports.generateDailyFocus = generateDailyFocus;
const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        month: "short",
        day: "numeric",
    });
};
