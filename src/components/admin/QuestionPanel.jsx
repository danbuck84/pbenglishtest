/**
 * QuestionPanel — renders the current question for the admin.
 * Handles both multiple-choice (radio buttons) and free-text (textarea) types.
 */

import { useState } from "react";
import { QUESTIONS, TOTAL_QUESTIONS } from "../../constants/questions";

export default function QuestionPanel({
  currentIndex,
  answers,
  onAnswer,
  onNext,
  onFinish,
  candidateName,
}) {
  const question = QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1;
  const currentAnswer = answers[question.id] || "";
  const [localFreeText, setLocalFreeText] = useState("");

  // Keep local free text in sync when navigating (if we ever add "previous")
  const freeTextValue = currentAnswer || localFreeText;

  const handleSelectOption = (label) => {
    onAnswer(question.id, label);
  };

  const handleFreeTextChange = (e) => {
    const value = e.target.value;
    setLocalFreeText(value);
    onAnswer(question.id, value);
  };

  const handleAdvance = () => {
    if (isLastQuestion) {
      onFinish();
    } else {
      setLocalFreeText("");
      onNext();
    }
  };

  // Level badge color mapping
  const levelColors = {
    A1: "bg-green-100 text-green-800",
    A2: "bg-emerald-100 text-emerald-800",
    B1: "bg-blue-100 text-blue-800",
    B2: "bg-indigo-100 text-indigo-800",
    C1: "bg-purple-100 text-purple-800",
    C2: "bg-amber-100 text-amber-800",
  };

  const typeLabel = question.type === "multiple_choice" ? "Múltipla Escolha" : "Resposta Livre";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with candidate name and progress */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Candidato</p>
          <p className="text-lg font-semibold text-gray-800">{candidateName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Progresso</p>
          <p className="text-lg font-semibold text-indigo-600">
            {currentIndex + 1} / {TOTAL_QUESTIONS}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Level and type badges */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${levelColors[question.level]}`}>
            {question.level}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600">
            {typeLabel}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-gray-500">
            Pergunta {currentIndex + 1}
          </span>
        </div>

        {/* Question text (in English) */}
        <h3 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">
          {question.questionText}
        </h3>

        {/* Answer area */}
        {question.type === "multiple_choice" ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-3">Selecione a resposta do candidato:</p>
            {question.options.map((option) => (
              <button
                key={option.label}
                onClick={() => handleSelectOption(option.label)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                  currentAnswer === option.label
                    ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm font-bold ${
                    currentAnswer === option.label
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {option.label}
                </span>
                <span className="text-gray-800">{option.text}</span>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">
              Digite a resposta falada pelo candidato:
            </p>
            <textarea
              value={freeTextValue}
              onChange={handleFreeTextChange}
              placeholder="Transcreva aqui a resposta do candidato em inglês..."
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Caso o candidato não consiga responder, deixe em branco ou escreva "sem resposta".
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleAdvance}
            className={`px-8 py-3 font-semibold rounded-xl transition-all text-lg ${
              isLastQuestion
                ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300"
                : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300"
            }`}
          >
            {isLastQuestion ? "Finalizar Avaliação ✓" : "Próxima Pergunta →"}
          </button>
        </div>
      </div>
    </div>
  );
}
