/**
 * AdminPage — the main admin view at /admin.
 *
 * Phases:
 *  1. idle       → Show candidate registration form
 *  2. testing    → Show questions one by one
 *  3. evaluating → Show loading spinner while Gemini processes
 *  4. finished   → Show results summary with option to start new test
 */

import { useState, useEffect, useCallback } from "react";
import CandidateRegistration from "../components/admin/CandidateRegistration";
import QuestionPanel from "../components/admin/QuestionPanel";
import { QUESTIONS } from "../constants/questions";
import {
  createCandidate,
  saveAssessment,
  updateSession,
  resetSession,
} from "../services/firestore";
import { evaluateTest } from "../services/gemini";

export default function AdminPage() {
  const [phase, setPhase] = useState("idle"); // idle | testing | evaluating | finished
  const [candidate, setCandidate] = useState(null);
  const [candidateId, setCandidateId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sincronizar o índice da pergunta atual com a tela do candidato
  useEffect(() => {
    if (phase === "testing") {
      updateSession({ currentQuestionIndex: currentIndex }).catch(console.error);
    }
  }, [currentIndex, phase]);

  // ─── Phase 1: Register candidate ───
  const handleRegister = async (candidateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const id = await createCandidate(candidateData);
      setCandidateId(id);
      setCandidate(candidateData);
      await updateSession({
        status: "testing",
        candidateName: candidateData.name,
        finalLevel: "",
        studyPlan: "",
        assessmentId: "",
      });
      setPhase("testing");
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.message || "Erro ao registrar candidato. Verifique a conexão e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Phase 2: Record answers ───
  const handleAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleNextQuestion = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  // ─── Phase 3: Finish test → Evaluate with Gemini ───
  const handleFinishTest = async () => {
    setPhase("evaluating");
    setError(null);
    updateSession({ status: "evaluating" }).catch(console.error);

    // Calculate MC score
    const mcQuestions = QUESTIONS.filter((q) => q.type === "multiple_choice");
    const multipleChoiceScore = mcQuestions.reduce((score, q) => {
      const correct = q.options.find((o) => o.isCorrect);
      return score + (answers[q.id] === correct?.label ? 1 : 0);
    }, 0);

    try {
      // Call Gemini AI for evaluation
      const aiResult = await evaluateTest({
        answers,
        multipleChoiceScore,
        candidateName: candidate.name,
      });

      // Save assessment to Firestore
      const assessmentId = await saveAssessment({
        candidateId,
        candidateName: candidate.name,
        answers,
        multipleChoiceScore,
        finalLevel: aiResult.level,
        studyPlan: aiResult.studyPlan,
        schedule: aiResult.schedule || [],
        recommendations: aiResult.recommendations || [],
        aiFeedback: aiResult.aiFeedback,
      });

      // Update session so Display View shows results
      await updateSession({
        status: "finished",
        candidateName: candidate.name,
        finalLevel: aiResult.level,
        studyPlan: aiResult.studyPlan,
        assessmentId,
      });

      setResults({
        ...aiResult,
        assessmentId,
        multipleChoiceScore,
      });
      setPhase("finished");
    } catch (err) {
      console.error("Evaluation failed:", err);
      setError(err.message || "Erro ao avaliar o teste. Tente novamente.");
      setPhase("testing");
      setCurrentIndex(QUESTIONS.length - 1); // Go back to last question
    }
  };

  // ─── Phase 4: Start new test ───
  const handleNewTest = async () => {
    await resetSession();
    setPhase("idle");
    setCandidate(null);
    setCandidateId(null);
    setCurrentIndex(0);
    setAnswers({});
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Painel do Administrador</h1>
              <p className="text-sm text-gray-500">Teste de Nível de Inglês</p>
            </div>
          </div>
          {phase !== "idle" && (
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                phase === "testing" ? "bg-yellow-400 animate-pulse" :
                phase === "evaluating" ? "bg-blue-400 animate-pulse" :
                "bg-green-400"
              }`} />
              <span className="text-sm text-gray-600">
                {phase === "testing" && "Avaliação em andamento"}
                {phase === "evaluating" && "Processando resultado..."}
                {phase === "finished" && "Avaliação concluída"}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Phase: Registration */}
        {phase === "idle" && (
          <CandidateRegistration onRegister={handleRegister} isLoading={isLoading} />
        )}

        {/* Phase: Testing */}
        {phase === "testing" && (
          <QuestionPanel
            currentIndex={currentIndex}
            answers={answers}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
            onFinish={handleFinishTest}
            candidateName={candidate?.name}
          />
        )}

        {/* Phase: Evaluating */}
        {phase === "evaluating" && (
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <div className="animate-spin-slow mb-8">
                <span className="text-6xl">🤖</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Analisando Respostas...
              </h2>
              <p className="text-gray-500 mb-6">
                A inteligência artificial está avaliando o desempenho do candidato.
                Isso pode levar alguns segundos.
              </p>
              <div className="flex justify-center gap-1">
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          </div>
        )}

        {/* Phase: Finished */}
        {phase === "finished" && results && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <span className="text-6xl block mb-4">🎉</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Avaliação Concluída!</h2>
              <p className="text-gray-500 mb-6">O resultado está sendo exibido no monitor externo.</p>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-500 mb-1">Candidato</p>
                <p className="text-lg font-semibold text-gray-800">{candidate?.name}</p>

                <div className="my-4 w-16 h-0.5 bg-gray-200 mx-auto" />

                <p className="text-sm text-gray-500 mb-1">Nível Final</p>
                <span className="inline-block text-4xl font-black text-indigo-600">{results.level}</span>

                <div className="my-4 w-16 h-0.5 bg-gray-200 mx-auto" />

                <p className="text-sm text-gray-500 mb-1">Múltipla Escolha</p>
                <p className="text-lg font-semibold text-gray-800">{results.multipleChoiceScore} / 6 corretas</p>
              </div>

              {/* AI status indicator — helps debug Gemini issues */}
              <div className={`rounded-xl p-4 mb-6 text-left text-sm ${
                results.aiFeedback && results.aiFeedback.startsWith("AI evaluation failed")
                  ? "bg-amber-50 border border-amber-200"
                  : results.aiFeedback && !results.aiFeedback.includes("not configured")
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}>
                <p className="font-semibold mb-1">
                  {results.aiFeedback && results.aiFeedback.startsWith("AI evaluation failed")
                    ? "⚠️ IA usou modo fallback"
                    : results.aiFeedback && !results.aiFeedback.includes("not configured")
                    ? "✅ Avaliação por IA concluída"
                    : "❌ IA não configurada"}
                </p>
                <p className="text-gray-600 break-words">{results.aiFeedback || "Sem detalhes"}</p>
              </div>

              <button
                onClick={handleNewTest}
                className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-all text-lg"
              >
                Nova Avaliação
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
