/**
 * Gemini AI service — evaluates placement test answers and generates
 * a personalized study plan in Portuguese (PT-BR).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { QUESTIONS } from "../constants/questions";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Evaluate the candidate's test performance using Gemini.
 *
 * @param {object}  params
 * @param {object}  params.answers              Map of questionId → answer value
 * @param {number}  params.multipleChoiceScore  Number of correct MC answers (0-6)
 * @param {string}  params.candidateName        Candidate's name for personalization
 * @returns {Promise<{ level: string, studyPlan: string, aiFeedback: string }>}
 */
export async function evaluateTest({ answers, multipleChoiceScore, candidateName }) {
  // Build a human-readable summary of the answers for the prompt
  const mcSummary = QUESTIONS.filter((q) => q.type === "multiple_choice")
    .map((q) => {
      const chosen = answers[q.id];
      const correct = q.options.find((o) => o.isCorrect);
      const isCorrect = chosen === correct?.label;
      return `- [${q.level}] "${q.questionText}" → Candidate chose: ${chosen || "no answer"} (${isCorrect ? "CORRECT" : "INCORRECT"}, correct answer: ${correct?.label})`;
    })
    .join("\n");

  const freeTextSummary = QUESTIONS.filter((q) => q.type === "free_text")
    .map((q) => {
      const answer = answers[q.id] || "(no answer provided)";
      return `- [${q.level}] "${q.questionText}"\n  Candidate's answer: "${answer}"`;
    })
    .join("\n\n");

  const prompt = `You are an expert English language proficiency evaluator using the CEFR framework (A1 to C2).

Analyze the following placement test results for a candidate named "${candidateName}".

═══ MULTIPLE CHOICE RESULTS (A1, A2, B1 levels) ═══
Score: ${multipleChoiceScore} out of 6 correct.
Details:
${mcSummary}

═══ FREE TEXT ANSWERS (B2, C1, C2 levels) ═══
${freeTextSummary}

═══ YOUR TASK ═══
1. Evaluate the grammatical correctness, vocabulary range, and textual cohesion of each free-text answer.
2. Considering BOTH the multiple-choice score AND the free-text quality, determine the candidate's final CEFR level. Be fair but accurate:
   - If they got most MC wrong and gave very poor or no free-text answers → A1
   - If they got MC mostly right but struggled with free text → A2 or B1
   - If free-text answers show moderate ability → B1 or B2
   - If free-text answers are well-structured with good vocabulary → B2 or C1
   - If free-text answers are sophisticated, nuanced, and near-native → C1 or C2
3. Generate a SHORT, personalized study plan entirely in PORTUGUESE (PT-BR). The plan should:
   - Address the candidate's specific grammatical mistakes.
   - Suggest areas of vocabulary to improve.
   - Recommend concrete next steps (e.g., types of exercises, resources).
   - Be encouraging and supportive in tone.
   - Be concise (max 6-8 bullet points).

Respond ONLY with valid JSON in this exact format (no markdown, no code fences):
{
  "level": "B1",
  "feedback": "Brief English analysis of the candidate's performance...",
  "studyPlan": "Plano de estudos em português..."
}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse the JSON response — strip markdown fences if Gemini wraps them
    const cleaned = responseText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      level: parsed.level || "A1",
      studyPlan: parsed.studyPlan || "Plano de estudos não disponível.",
      aiFeedback: parsed.feedback || "",
    };
  } catch (error) {
    console.error("Gemini evaluation failed:", error);

    // Fallback: determine level purely from MC score
    const fallbackLevel = determineFallbackLevel(multipleChoiceScore);
    return {
      level: fallbackLevel,
      studyPlan:
        "Não foi possível gerar um plano de estudos personalizado neste momento. " +
        "Recomendamos praticar com aplicativos como Duolingo ou buscar um curso presencial.",
      aiFeedback: `AI evaluation failed: ${error.message}`,
    };
  }
}

/**
 * Simple fallback level determination based only on MC score.
 */
function determineFallbackLevel(score) {
  if (score <= 1) return "A1";
  if (score <= 2) return "A2";
  if (score <= 4) return "B1";
  if (score <= 5) return "B2";
  return "C1";
}
