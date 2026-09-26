/**
 * QuestionPanel — renders the current question for the admin.
 * Handles both multiple-choice (radio buttons) and free-text (textarea) types.
 *
 * MC options are shuffled per-question so the correct answer isn't always first.
 */

import { useState, useMemo, useRef, useEffect } from "react";
import { QUESTIONS, TOTAL_QUESTIONS } from "../../constants/questions";
import { shuffleOptions, hashString } from "../../utils/shuffle";
import Stopwatch from "./Stopwatch";

export default function QuestionPanel({
  currentIndex,
  answers,
  onAnswer,
  onNext,
  onFinish,
  candidateName,
  testStartTime,
}) {
  const question = QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1;
  const currentAnswer = answers[question.id] || "";
  const [localFreeText, setLocalFreeText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      // Set language to pt-BR for INFO questions (13 and 14), otherwise en-US
      recognition.lang = question.level === "INFO" ? "pt-BR" : "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setLocalFreeText((prev) => {
            const newText = prev ? prev + " " + finalTranscript : finalTranscript;
            onAnswer(question.id, newText);
            return newText;
          });
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [question.id, question.level, onAnswer]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setLocalFreeText(""); // Clear previous text when starting fresh recording
      onAnswer(question.id, "");
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start recording", err);
      }
    }
  };

  // Stop recording when changing questions
  useEffect(() => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [currentIndex]);

  // Shuffle MC options so the correct answer isn't always the first one.
  // useMemo ensures stable order while viewing the same question.
  const shuffledOptions = useMemo(() => {
    if (question.type !== "multiple_choice") return [];
    return shuffleOptions(question.options, hashString(question.id));
  }, [question.id, question.type, question.options]);

  // Keep local free text in sync when navigating
  const freeTextValue = currentAnswer || localFreeText;

  // For MC, we store the ORIGINAL label of the selected option (the one
  // that maps back to the correct answer in questions.js).
  const handleSelectOption = (originalLabel) => {
    onAnswer(question.id, originalLabel);
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
    INFO: "bg-gray-100 text-gray-800",
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
        
        {/* Stopwatch rendering */}
        {testStartTime && <Stopwatch startTime={testStartTime} />}

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
            {shuffledOptions.map((option) => (
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
                  {option.displayLabel}
                </span>
                <span className="text-gray-800">{option.text}</span>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-500">
                Digite a resposta falada pelo candidato:
              </p>
              {recognitionRef.current && (
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                    isRecording 
                      ? "bg-red-100 text-red-600 border border-red-200 animate-pulse"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                  }`}
                >
                  {isRecording ? "🔴 Gravando áudio..." : "🎤 Transcrever Áudio"}
                </button>
              )}
            </div>
            
            <textarea
              value={freeTextValue}
              onChange={handleFreeTextChange}
              placeholder={isRecording ? "Ouvindo... (fale em inglês)" : "Transcreva aqui a resposta do candidato em inglês..."}
              rows={5}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none resize-none ${
                isRecording 
                  ? "border-red-300 focus:ring-2 focus:ring-red-400 bg-red-50/30"
                  : "border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            <p className="text-xs text-gray-400 mt-2">
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
