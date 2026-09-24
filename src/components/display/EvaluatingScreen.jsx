export default function EvaluatingScreen({ candidateName }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white relative overflow-hidden px-6">
      <div className="absolute top-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
        {candidateName && (
          <h1 className="text-4xl md:text-5xl font-light text-indigo-200 mb-12">
            {candidateName}
          </h1>
        )}

        <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/20 flex flex-col items-center">
          <div className="relative w-32 h-32 mb-8 flex justify-center items-center">
            {/* Spinning AI circles */}
            <div className="absolute inset-0 rounded-full border-t-4 border-indigo-400 animate-spin" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-2 rounded-full border-r-4 border-purple-400 animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
            <div className="absolute inset-4 rounded-full border-b-4 border-blue-400 animate-spin" style={{ animationDuration: "1.5s" }} />
            <span className="text-4xl relative z-10">🧠</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
            Finalizando Teste...
          </h2>
          <p className="text-indigo-200 text-lg">
            Nossa Inteligência Artificial está processando suas respostas e montando o seu Plano de Estudos personalizado.
          </p>
        </div>
      </div>
    </div>
  );
}
