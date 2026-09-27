/**
 * AnalyticsPage — admin-only data analytics & reporting dashboard.
 *
 * Fetches all assessments from Firestore and displays:
 *  - KPI summary cards (total candidates, avg score, avg time, level distribution)
 *  - CEFR level distribution bar chart (pure CSS)
 *  - Individual candidate table with scores, levels, and duration
 *  - PDF export via window.print()
 *
 * Route: /analytics
 */

import { useState, useEffect, useMemo } from "react";
import { getAllAssessments } from "../services/firestore";

// ─── Helpers ─────────────────────────────────────────────────────

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

const LEVEL_COLORS = {
  A1: { bg: "bg-green-500", text: "text-green-700", light: "bg-green-100" },
  A2: { bg: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-100" },
  B1: { bg: "bg-blue-500", text: "text-blue-700", light: "bg-blue-100" },
  B2: { bg: "bg-indigo-500", text: "text-indigo-700", light: "bg-indigo-100" },
  C1: { bg: "bg-purple-500", text: "text-purple-700", light: "bg-purple-100" },
  C2: { bg: "bg-amber-500", text: "text-amber-700", light: "bg-amber-100" },
};

function formatDuration(totalSeconds) {
  if (!totalSeconds && totalSeconds !== 0) return "—";
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(timestamp) {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ───────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllAssessments();
        setAssessments(data);
      } catch (err) {
        console.error("Failed to load assessments:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ─── Computed stats ────────────────────────────────────────────

  const stats = useMemo(() => {
    if (assessments.length === 0) return null;

    const total = assessments.length;

    // MC score
    const mcScores = assessments.map((a) => a.multipleChoiceScore ?? 0);
    const avgMC = mcScores.reduce((s, v) => s + v, 0) / total;
    const bestMC = Math.max(...mcScores);
    const worstMC = Math.min(...mcScores);

    // Duration
    const withDuration = assessments.filter((a) => a.durationSeconds > 0);
    const avgDuration = withDuration.length
      ? withDuration.reduce((s, a) => s + a.durationSeconds, 0) / withDuration.length
      : 0;
    const fastestTest = withDuration.length ? Math.min(...withDuration.map((a) => a.durationSeconds)) : 0;
    const slowestTest = withDuration.length ? Math.max(...withDuration.map((a) => a.durationSeconds)) : 0;

    // Level distribution
    const levelCounts = {};
    LEVEL_ORDER.forEach((l) => (levelCounts[l] = 0));
    assessments.forEach((a) => {
      if (a.finalLevel && levelCounts[a.finalLevel] !== undefined) {
        levelCounts[a.finalLevel]++;
      }
    });
    const maxLevelCount = Math.max(...Object.values(levelCounts), 1);

    // Most common level
    const mostCommonLevel = Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      total,
      avgMC: avgMC.toFixed(1),
      bestMC,
      worstMC,
      avgDuration: Math.round(avgDuration),
      fastestTest,
      slowestTest,
      levelCounts,
      maxLevelCount,
      mostCommonLevel: mostCommonLevel ? mostCommonLevel[0] : "—",
    };
  }, [assessments]);

  // ─── Sorting ───────────────────────────────────────────────────

  const sortedAssessments = useMemo(() => {
    const sorted = [...assessments].sort((a, b) => {
      let valA, valB;

      switch (sortField) {
        case "candidateName":
          valA = (a.candidateName || "").toLowerCase();
          valB = (b.candidateName || "").toLowerCase();
          return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        case "finalLevel":
          valA = LEVEL_ORDER.indexOf(a.finalLevel);
          valB = LEVEL_ORDER.indexOf(b.finalLevel);
          break;
        case "multipleChoiceScore":
          valA = a.multipleChoiceScore ?? 0;
          valB = b.multipleChoiceScore ?? 0;
          break;
        case "durationSeconds":
          valA = a.durationSeconds ?? 0;
          valB = b.durationSeconds ?? 0;
          break;
        case "createdAt":
        default:
          valA = a.createdAt?.toDate?.() || new Date(0);
          valB = b.createdAt?.toDate?.() || new Date(0);
          valA = valA.getTime();
          valB = valB.getTime();
          break;
      }

      return sortDir === "asc" ? valA - valB : valB - valA;
    });
    return sorted;
  }, [assessments, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  };

  // ─── Render ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">📊</div>
          <p className="text-gray-500 text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md text-center">
          <p className="font-semibold mb-2">Erro ao carregar dados</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 print:border-0">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span>📊</span> Relatório de Avaliações
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Teste de Nível de Inglês — Igreja Batista Farol
            </p>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              🔄 Atualizar
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
            >
              🖨️ Exportar PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {assessments.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">📭</span>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma avaliação ainda</h2>
            <p className="text-gray-500">Os dados aparecerão aqui conforme os candidatos forem avaliados.</p>
          </div>
        ) : (
          <>
            {/* ─── KPI Cards ──────────────────────────────────── */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KPICard
                icon="👥"
                label="Total de Candidatos"
                value={stats.total}
              />
              <KPICard
                icon="📝"
                label="Média Múltipla Escolha"
                value={`${stats.avgMC} / 6`}
                sub={`Melhor: ${stats.bestMC} · Pior: ${stats.worstMC}`}
              />
              <KPICard
                icon="⏱️"
                label="Tempo Médio"
                value={formatDuration(stats.avgDuration)}
                sub={`Mais rápido: ${formatDuration(stats.fastestTest)} · Mais lento: ${formatDuration(stats.slowestTest)}`}
              />
              <KPICard
                icon="🏆"
                label="Nível Mais Comum"
                value={stats.mostCommonLevel}
                sub={`${stats.levelCounts[stats.mostCommonLevel]} candidato(s)`}
              />
            </section>

            {/* ─── Level Distribution Chart ────────────────────── */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>📈</span> Distribuição por Nível CEFR
              </h2>
              <div className="grid grid-cols-6 gap-3 items-end" style={{ minHeight: "200px" }}>
                {LEVEL_ORDER.map((level) => {
                  const count = stats.levelCounts[level];
                  const pct = count > 0 ? (count / stats.maxLevelCount) * 100 : 0;
                  const colors = LEVEL_COLORS[level];
                  return (
                    <div key={level} className="flex flex-col items-center gap-2">
                      {/* Count label */}
                      <span className={`text-sm font-bold ${colors.text}`}>
                        {count}
                      </span>
                      {/* Bar */}
                      <div className="w-full flex flex-col justify-end" style={{ height: "160px" }}>
                        <div
                          className={`${colors.bg} rounded-t-lg transition-all duration-700 w-full mx-auto`}
                          style={{
                            height: `${Math.max(pct, 4)}%`,
                            maxWidth: "60px",
                            margin: "0 auto",
                          }}
                        />
                      </div>
                      {/* Level label */}
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors.light} ${colors.text}`}>
                        {level}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Percentage summary */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4 justify-center">
                {LEVEL_ORDER.map((level) => {
                  const count = stats.levelCounts[level];
                  const pct = stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : 0;
                  return (
                    <span key={level} className="text-sm text-gray-600">
                      <span className="font-semibold">{level}:</span> {count} ({pct}%)
                    </span>
                  );
                })}
              </div>
            </section>

            {/* ─── Candidates Table ───────────────────────────── */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span>📋</span> Detalhamento por Candidato
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-6 py-3 font-semibold text-gray-600">#</th>
                      <th
                        className="px-6 py-3 font-semibold text-gray-600 cursor-pointer hover:text-indigo-600 select-none"
                        onClick={() => handleSort("candidateName")}
                      >
                        Candidato {sortIcon("candidateName")}
                      </th>
                      <th
                        className="px-6 py-3 font-semibold text-gray-600 cursor-pointer hover:text-indigo-600 select-none text-center"
                        onClick={() => handleSort("finalLevel")}
                      >
                        Nível {sortIcon("finalLevel")}
                      </th>
                      <th
                        className="px-6 py-3 font-semibold text-gray-600 cursor-pointer hover:text-indigo-600 select-none text-center"
                        onClick={() => handleSort("multipleChoiceScore")}
                      >
                        MC (/ 6) {sortIcon("multipleChoiceScore")}
                      </th>
                      <th
                        className="px-6 py-3 font-semibold text-gray-600 cursor-pointer hover:text-indigo-600 select-none text-center"
                        onClick={() => handleSort("durationSeconds")}
                      >
                        Tempo {sortIcon("durationSeconds")}
                      </th>
                      <th
                        className="px-6 py-3 font-semibold text-gray-600 cursor-pointer hover:text-indigo-600 select-none"
                        onClick={() => handleSort("createdAt")}
                      >
                        Data {sortIcon("createdAt")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAssessments.map((a, idx) => {
                      const colors = LEVEL_COLORS[a.finalLevel] || LEVEL_COLORS.B1;
                      return (
                        <tr
                          key={a.id}
                          className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-3 text-gray-400 font-mono text-xs">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-3 font-medium text-gray-800">
                            {a.candidateName || "—"}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${colors.light} ${colors.text}`}>
                              {a.finalLevel || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center font-semibold text-gray-700">
                            {a.multipleChoiceScore ?? "—"}
                          </td>
                          <td className="px-6 py-3 text-center font-mono text-gray-600">
                            {formatDuration(a.durationSeconds)}
                          </td>
                          <td className="px-6 py-3 text-gray-500 text-xs">
                            {formatDate(a.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ─── Print Footer ───────────────────────────────── */}
            <footer className="text-center text-gray-400 text-xs py-4 print:mt-8">
              <p className="font-semibold text-gray-600">Teacher Dan Buck</p>
              <p>📱 (12) 99745-1984 · ✉️ daniel.buck@gmail.com</p>
              <p className="mt-1">⛪ Igreja Batista Farol — Relatório gerado em {new Date().toLocaleDateString("pt-BR")}</p>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────

function KPICard({ icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-black text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
