/**
 * TestingScreen — shown on the Display View while the test is in progress.
 * Features animated ripple effect and the candidate's name.
 */

export default function TestingScreen({ candidateName }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Animated ripple circles */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-12">
          {/* Ripple rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-2 border-indigo-400/30 animate-ripple" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-2 border-indigo-400/20 animate-ripple" style={{ animationDelay: "0.6s" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-2 border-indigo-400/10 animate-ripple" style={{ animationDelay: "1.2s" }} />
          </div>

          {/* Center icon */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-4xl">🎓</span>
            </div>
          </div>
        </div>

        {/* Candidate name */}
        {candidateName && (
          <p className="text-2xl md:text-3xl font-light text-indigo-200 mb-4">
            {candidateName}
          </p>
        )}

        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-center">
          Avaliação em Andamento
        </h2>

        <div className="flex items-center gap-3 text-indigo-300/80">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
          <span className="text-lg">Por favor, aguarde</span>
        </div>
      </div>
    </div>
  );
}
