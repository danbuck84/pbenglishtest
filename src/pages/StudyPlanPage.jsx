/**
 * StudyPlanPage — accessible at /plan/:assessmentId.
 * This is the page that the QR code links to.
 * It fetches the assessment from Firestore and displays the personalized study plan.
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAssessment } from "../services/firestore";
import { QUESTIONS, LEVEL_DESCRIPTIONS } from "../constants/questions";

export default function StudyPlanPage() {
  const { assessmentId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAssessment() {
      try {
        const data = await getAssessment(assessmentId);
        if (data) {
          setAssessment(data);
        } else {
          setError("Avaliação não encontrada.");
        }
      } catch (err) {
        console.error("Failed to fetch assessment:", err);
        setError("Erro ao carregar o plano de estudos.");
      } finally {
        setLoading(false);
      }
    }

    fetchAssessment();
  }, [assessmentId]);

  // Level color mapping
  const levelColors = {
    A1: "from-green-500 to-emerald-600",
    A2: "from-emerald-500 to-teal-600",
    B1: "from-blue-500 to-indigo-600",
    B2: "from-indigo-500 to-violet-600",
    C1: "from-purple-500 to-fuchsia-600",
    C2: "from-amber-500 to-orange-600",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <p className="text-gray-500 text-lg">Carregando plano de estudos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <span className="text-5xl block mb-4">😕</span>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops!</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const gradient = levelColors[assessment.finalLevel] || "from-indigo-500 to-purple-600";
  const description = LEVEL_DESCRIPTIONS[assessment.finalLevel] || "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with level */}
      <header className={`bg-gradient-to-r ${gradient} text-white py-12 px-6`}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg text-white/80 mb-2">Resultado do Teste de Nível</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            {assessment.candidateName}
          </h1>

          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 border-4 border-white/40 mb-4">
            <span className="text-4xl font-black">{assessment.finalLevel}</span>
          </div>

          <p className="text-white/90 text-lg max-w-lg mx-auto">{description}</p>
        </div>
      </header>

      {/* Study plan content */}
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📖</span>
            <h2 className="text-2xl font-bold text-gray-800">
              Plano de Estudos Personalizado
            </h2>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {assessment.studyPlan}
          </div>

          {/* Score summary */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Nível</p>
                <p className="text-2xl font-bold text-indigo-600">{assessment.finalLevel}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Múltipla Escolha</p>
                <p className="text-2xl font-bold text-indigo-600">{assessment.multipleChoiceScore}/6</p>
              </div>
            </div>
          </div>
        </div>
        {/* Q&A Review Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📝</span>
            <h2 className="text-2xl font-bold text-gray-800">
              Revisão das Respostas
            </h2>
          </div>

          <div className="space-y-6">
            {QUESTIONS.map((q, index) => {
              const answer = assessment.answers[q.id];
              // Skip questions they didn't answer (useful for free-text)
              if (!answer && q.type === "free_text") return null;

              const isMC = q.type === "multiple_choice";
              let mcCorrect = false;
              let correctAnswerLabel = "";
              let correctAnswerText = "";

              if (isMC) {
                const correctOption = q.options.find((o) => o.isCorrect);
                correctAnswerLabel = correctOption?.label;
                correctAnswerText = correctOption?.text;
                mcCorrect = answer === correctAnswerLabel;
              }

              return (
                <div key={q.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-gray-400 mt-0.5">{index + 1}.</span>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium mb-2">{q.questionText}</p>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Sua resposta:</p>
                        <p className={`font-medium ${
                          isMC ? (mcCorrect ? "text-green-600" : "text-red-600") : "text-gray-700 italic"
                        }`}>
                          {answer || "(Sem resposta)"}
                          {isMC && answer && ` - ${q.options.find(o => o.label === answer)?.text}`}
                          {isMC && mcCorrect && " ✓"}
                          {isMC && !mcCorrect && answer && " ✗"}
                        </p>

                        {isMC && !mcCorrect && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Resposta correta:</p>
                            <p className="font-medium text-green-600">
                              {correctAnswerLabel} - {correctAnswerText}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>⛪ Teste de Nível de Inglês — Comunidade</p>
        </div>
      </main>
    </div>
  );
}
