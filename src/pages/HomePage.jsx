/**
 * HomePage — landing page at /.
 * Provides navigation links to the Admin and Display views.
 */

import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        {/* Logo / Title */}
        <div className="mb-10">
          <span className="text-7xl block mb-4">📝</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            Teste de Nível
          </h1>
          <p className="text-xl text-indigo-300">de Inglês</p>
          <div className="w-16 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto rounded-full mt-4" />
        </div>

        {/* Navigation cards */}
        <div className="space-y-4">
          <Link
            to="/admin"
            className="block bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl group-hover:scale-110 transition-transform">🖥️</span>
              <div className="text-left">
                <h2 className="text-xl font-bold text-white">Painel do Administrador</h2>
                <p className="text-indigo-300 text-sm">Registrar candidatos e aplicar o teste</p>
              </div>
              <span className="ml-auto text-white/50 group-hover:text-white transition-colors text-2xl">→</span>
            </div>
          </Link>

          <Link
            to="/display"
            className="block bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl group-hover:scale-110 transition-transform">📺</span>
              <div className="text-left">
                <h2 className="text-xl font-bold text-white">Tela de Exibição</h2>
                <p className="text-indigo-300 text-sm">Monitor externo para o candidato</p>
              </div>
              <span className="ml-auto text-white/50 group-hover:text-white transition-colors text-2xl">→</span>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-12 text-indigo-400/50 text-sm flex items-center justify-center gap-2">
          <span>⛪</span> Comunidade
        </p>
      </div>
    </div>
  );
}
