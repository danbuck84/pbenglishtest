/**
 * Gemini AI service — evaluates placement test answers and generates
 * a personalized study plan in Portuguese (PT-BR).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { QUESTIONS } from "../constants/questions";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

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
  // Count how many free-text questions actually have answers
  const freeTextQuestions = QUESTIONS.filter((q) => q.type === "free_text" && q.level !== "INFO");
  const answeredFreeText = freeTextQuestions.filter(
    (q) => answers[q.id] && answers[q.id].trim().length > 0
  );

  const dailyTime = answers["q13"] || "Tempo não informado (assuma 30 minutos)";

  // Build a human-readable summary of the answers for the prompt
  const mcSummary = QUESTIONS.filter((q) => q.type === "multiple_choice")
    .map((q) => {
      const chosen = answers[q.id];
      const correct = q.options.find((o) => o.isCorrect);
      const isCorrect = chosen === correct?.label;
      return `- [${q.level}] "${q.questionText}" → Candidate chose: ${chosen || "no answer"} (${isCorrect ? "CORRECT" : "INCORRECT"})`;
    })
    .join("\n");

  const freeTextSummary = freeTextQuestions
    .map((q) => {
      const answer = answers[q.id] || "(no answer provided)";
      return `- [${q.level}] "${q.questionText}"\n  Candidate's answer: "${answer}"`;
    })
    .join("\n\n");

  const prompt = `You are an expert English language proficiency evaluator using the CEFR framework (A1 to C2).
HOWEVER, you are evaluating an informal, welcoming community test. DO NOT be overly strict or academic.
Value conversational fluency, natural phrasing, internet slang, and idioms. Do not penalize candidates for lack of academic register or philosophical depth if their English is otherwise highly fluent.

Analyze the following placement test results for a candidate named "${candidateName}".

═══ MULTIPLE CHOICE RESULTS (A1, A2, B1 levels) ═══
Score: ${multipleChoiceScore} out of 6 correct.
Details:
${mcSummary}

═══ FREE TEXT ANSWERS (B2, C1, C2 levels) ═══
Number of free-text questions answered: ${answeredFreeText.length} out of ${freeTextQuestions.length}
${freeTextSummary}

═══ DAILY STUDY TIME ═══
The candidate wants to practice for: ${dailyTime} per day.

═══ YOUR TASK ═══
1. Determine the candidate's final CEFR level based on MC score and Free Text. 
   - Blank free text = Max B1.
   - High fluency / colloquialisms / idioms = B2, C1 or C2 depending on grammar complexity. Do not force academic register.
2. Generate a personalized, welcoming study plan in PORTUGUESE (PT-BR).
3. Generate a daily schedule breaking down the "${dailyTime}" into minutes/hours for: "Grammar", "Vocabulary", "Reading/Listening Content", and "Speaking Practice". (e.g., if 30 mins: 12 min Grammar, 8 min Vocabulary, 5 min Content, 5 min Speaking).
4. Provide exactly 4 media recommendations (1 Filme, 1 Série, 1 Livro, 1 Música) suitable for their CEFR level to help them practice.

Respond ONLY with valid JSON in this exact format (no markdown, no code fences):
{
  "level": "B1",
  "feedback": "English analysis of the candidate's performance...",
  "studyPlan": "Plano de estudos em português (texto livre e acolhedor)...",
  "schedule": [
    { "activity": "Gramática", "duration": "12 min" },
    { "activity": "Vocabulário", "duration": "8 min" },
    { "activity": "Leitura/Escuta", "duration": "5 min" },
    { "activity": "Fala (Speaking)", "duration": "5 min" }
  ],
  "recommendations": [
    { "type": "Filme", "title": "Nome do Filme", "reason": "Por que assistir..." },
    { "type": "Série", "title": "Nome da Série", "reason": "Por que assistir..." },
    { "type": "Livro", "title": "Nome do Livro", "reason": "Por que ler..." },
    { "type": "Música", "title": "Nome da Música/Artista", "reason": "Por que ouvir..." }
  ]
}`;

  // If no API key, skip the API call and go straight to fallback
  if (!genAI) {
    console.error("[Gemini] No API key found (VITE_GEMINI_API_KEY is empty).");
    const fallbackLevel = determineFallbackLevel(multipleChoiceScore, answeredFreeText.length);
    return {
      level: fallbackLevel,
      studyPlan: generateFallbackPlan(fallbackLevel),
      aiFeedback: "Gemini API key not configured.",
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
  let lastError = null;
  
  // Retry loop for 503 errors (high demand)
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`[Gemini] Attempt ${attempt}/3... waiting ${attempt * 1.5}s before retry.`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1500));
      }

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();

      // Parse the JSON response — strip markdown fences if Gemini wraps them
      const cleaned = responseText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
      const parsed = JSON.parse(cleaned);

      return {
        level: parsed.level || "A1",
        studyPlan: parsed.studyPlan || generateFallbackPlan(parsed.level || "A1"),
        aiFeedback: parsed.feedback || "",
      };
    } catch (error) {
      lastError = error;
      console.warn(`[Gemini] Attempt ${attempt} failed:`, error?.message);
      
      // If it's a 503 Service Unavailable, we retry. Otherwise, break and fallback.
      if (!error?.message?.includes("503") && !error?.message?.includes("high demand")) {
        break; 
      }
    }
  }

  // If we exhausted retries or hit a non-503 error, fallback
  console.error("[Gemini] Evaluation failed after retries:", lastError);
  
  const fallbackLevel = determineFallbackLevel(multipleChoiceScore, answeredFreeText.length);
  return {
    level: fallbackLevel,
    studyPlan: generateFallbackPlan(fallbackLevel),
    schedule: [],
    recommendations: [],
    aiFeedback: `AI evaluation failed: ${lastError?.message || "Unknown error"}`,
  };
}

/**
 * Smarter fallback level determination.
 * Considers BOTH MC score AND whether free-text was provided.
 * A candidate CANNOT be rated above B1 without free-text evidence.
 */
function determineFallbackLevel(mcScore, freeTextCount) {
  if (mcScore <= 1) return "A1";
  if (mcScore <= 2) return "A2";
  if (mcScore <= 4) return "B1";

  // MC score is 5 or 6, but we can only go above B1 if free-text was provided
  if (freeTextCount === 0) return "B1";
  if (freeTextCount <= 2) return "B1";
  if (mcScore <= 5) return "B2";
  return "B2"; // Never assume C-level without AI analysis
}

/**
 * Generate a basic study plan when Gemini is unavailable.
 */
function generateFallbackPlan(level) {
  const plans = {
    A1: `📚 Plano de Estudos — Nível A1 (Iniciante)

• Comece com vocabulário básico do dia a dia: cumprimentos, números, cores, família.
• Pratique frases simples no presente simples (I am, I have, I like).
• Use aplicativos como Duolingo ou Busuu para exercícios diários de 15 minutos.
• Assista vídeos curtos em inglês com legendas em português.
• Pratique ouvindo músicas simples e acompanhando a letra.
• Tente formar frases curtas sobre sua rotina diária.`,

    A2: `📚 Plano de Estudos — Nível A2 (Básico)

• Amplie seu vocabulário sobre temas do cotidiano: compras, viagens, saúde.
• Estude o passado simples (I went, I did) e o futuro com "going to".
• Leia textos curtos como notícias simplificadas ou histórias infantis em inglês.
• Pratique conversação descrevendo suas experiências passadas.
• Use o app HelloTalk para conversar com nativos.
• Assista séries em inglês com legendas em inglês.`,

    B1: `📚 Plano de Estudos — Nível B1 (Intermediário)

• Foque em tempos verbais compostos: present perfect, past continuous.
• Pratique expressões de opinião: "I think that...", "In my opinion...".
• Leia artigos de blogs ou revistas em inglês sobre temas de seu interesse.
• Assista séries e filmes sem legendas ou com legendas em inglês.
• Escreva pequenos textos (100-150 palavras) sobre temas variados.
• Pratique simulações de situações reais: entrevistas, viagens, atendimento.
• Estude phrasal verbs comuns (look up, give up, take off).`,

    B2: `📚 Plano de Estudos — Nível B2 (Intermediário Superior)

• Aprofunde o uso de condicionais (if I were..., if I had known...).
• Estude conectivos e estruturas para argumentação mais sofisticada.
• Leia livros, artigos acadêmicos ou jornais como BBC News e The Guardian.
• Pratique redação argumentativa com textos de 200-300 palavras.
• Participe de grupos de conversação em inglês.
• Estude vocabulário específico da sua área profissional.
• Assista palestras TED e tente resumir os pontos principais.`,

    C1: `📚 Plano de Estudos — Nível C1 (Avançado)

• Refine o uso de estruturas complexas: inversão, ênfase, voz passiva avançada.
• Leia literatura, ensaios e textos acadêmicos em inglês.
• Pratique escrita formal: e-mails profissionais, relatórios, artigos.
• Estude nuances de vocabulário: sinônimos, colocações, expressões idiomáticas.
• Participe de debates em inglês sobre temas complexos.
• Considere uma certificação internacional como IELTS ou Cambridge (CAE).`,

    C2: `📚 Plano de Estudos — Nível C2 (Proficiente)

• Mantenha sua fluência com leitura diversificada: ficção, não-ficção, artigos científicos.
• Refine seu estilo de escrita com foco em registro formal e informal.
• Pratique interpretação simultânea ou tradução de textos complexos.
• Explore dialetos e variações regionais do inglês (britânico, americano, australiano).
• Considere certificações avançadas: Cambridge CPE ou IELTS Academic (banda 8+).
• Ensine inglês a outros — ensinar é uma excelente forma de aperfeiçoar.`,
  };

  return plans[level] || plans.B1;
}
