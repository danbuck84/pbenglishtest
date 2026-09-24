/**
 * WaitingScreen — shown on the Display View when the session is idle.
 * Full-screen welcome message with floating animation.
 */

export default function WaitingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />

      {/* Main content */}
      <div className="relative z-10 text-center px-8">
        <div className="animate-float mb-8">
          <span className="text-8xl">📚</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
          Teste de Nível
        </h1>
        <h2 className="text-3xl md:text-4xl font-light text-indigo-200 mb-4">
          de Inglês
        </h2>

        <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto rounded-full mb-8" />

        <p className="text-xl md:text-2xl text-indigo-300/80 animate-pulse-slow">
          Aguardando próximo candidato...
        </p>

        <div className="mt-12 flex items-center justify-center gap-2 text-indigo-400/60 text-sm font-semibold tracking-wider">
          <span>⛪</span>
          <span>IGREJA BATISTA FAROL</span>
        </div>
      </div>
    </div>
  );
}
