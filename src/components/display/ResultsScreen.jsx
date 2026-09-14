/**
 * ResultsScreen — shown on the Display View when the test is finished.
 * Displays the CEFR level badge and a QR code linking to the study plan.
 */

import { QRCodeSVG } from "qrcode.react";
import { LEVEL_DESCRIPTIONS } from "../../constants/questions";

export default function ResultsScreen({ candidateName, finalLevel, assessmentId }) {
  // Build the study plan URL that the QR code will encode
  const studyPlanUrl = `${window.location.origin}/plan/${assessmentId}`;

  // Level-specific color schemes
  const levelColors = {
    A1: { bg: "from-green-600 to-emerald-700", badge: "bg-green-500", glow: "shadow-green-500/30" },
    A2: { bg: "from-emerald-600 to-teal-700", badge: "bg-emerald-500", glow: "shadow-emerald-500/30" },
    B1: { bg: "from-blue-600 to-indigo-700", badge: "bg-blue-500", glow: "shadow-blue-500/30" },
    B2: { bg: "from-indigo-600 to-violet-700", badge: "bg-indigo-500", glow: "shadow-indigo-500/30" },
    C1: { bg: "from-purple-600 to-fuchsia-700", badge: "bg-purple-500", glow: "shadow-purple-500/30" },
    C2: { bg: "from-amber-500 to-orange-600", badge: "bg-amber-500", glow: "shadow-amber-500/30" },
  };

  const colors = levelColors[finalLevel] || levelColors.B1;
  const description = LEVEL_DESCRIPTIONS[finalLevel] || "";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${colors.bg} text-white relative overflow-hidden`}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 text-6xl opacity-10 animate-float">🎉</div>
        <div className="absolute top-20 right-20 text-5xl opacity-10 animate-float" style={{ animationDelay: "1s" }}>⭐</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-10 animate-float" style={{ animationDelay: "0.5s" }}>🏆</div>
        <div className="absolute bottom-10 right-10 text-6xl opacity-10 animate-float" style={{ animationDelay: "1.5s" }}>📖</div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-8 max-w-2xl">
        {/* Congratulations */}
        <p className="text-2xl md:text-3xl font-light mb-2 text-white/80">Parabéns</p>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8">
          {candidateName}! 🎉
        </h1>

        {/* Level badge */}
        <div className="mb-8">
          <div className={`inline-flex items-center justify-center w-40 h-40 rounded-full ${colors.badge} shadow-2xl ${colors.glow} border-4 border-white/30`}>
            <span className="text-6xl font-black">{finalLevel}</span>
          </div>
        </div>

        {/* Level description */}
        <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
          {description}
        </p>

        <div className="w-24 h-1 bg-white/30 mx-auto rounded-full mb-10" />

        {/* QR Code section */}
        <div className="bg-white rounded-2xl p-6 inline-block shadow-2xl">
          <QRCodeSVG
            value={studyPlanUrl}
            size={200}
            level="M"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#1e1b4b"
          />
        </div>

        <p className="mt-6 text-lg text-white/80">
          📱 Escaneie o QR Code para ver seu
        </p>
        <p className="text-xl font-semibold text-white">
          Plano de Estudos Personalizado
        </p>
      </div>
    </div>
  );
}
