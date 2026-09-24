/**
 * TestingScreen — shown on the Display View while the test is in progress.
 * Features animated ripple effect and the candidate's name.
 */

import { useMemo } from "react";
import { QUESTIONS } from "../../constants/questions";
import { shuffleOptions, hashString } from "../../utils/shuffle";

export default function TestingScreen({ candidateName, currentQuestionIndex }) {
  const question = QUESTIONS[currentQuestionIndex];

  const shuffledOptions = useMemo(() => {
    if (!question || question.type !== "multiple_choice") return [];
    return shuffleOptions(question.options, hashString(question.id));
  }, [question]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white relative overflow-hidden px-6">
      {/* Decorative background */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
        
        {/* Candidate name prominently at the top */}
        {candidateName && (
          <h1 className="text-4xl md:text-5xl font-light text-indigo-200 mb-12">
            {candidateName}
          </h1>
        )}

        {/* Question display */}
        {question && (
          <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
            {/* Minimal header */}
            <p className="text-indigo-300 font-medium mb-6 uppercase tracking-widest text-sm">
              {question.type === "multiple_choice" ? "Múltipla Escolha" : "Resposta Falada"}
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-relaxed">
              {question.questionText}
            </h2>

            {question.type === "multiple_choice" ? (
              <div className="flex flex-col gap-4 text-left">
                {shuffledOptions.map((option) => (
                  <div key={option.label} className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/10">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-500/30 rounded-full flex items-center justify-center font-bold text-lg text-indigo-100">
                      {option.displayLabel}
                    </div>
                    <span className="text-lg md:text-xl text-gray-200">
                      {option.text}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center animate-pulse mb-4 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                  <span className="text-4xl">🎙️</span>
                </div>
                <p className="text-indigo-200 text-lg">Leia a pergunta e responda em voz alta.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
