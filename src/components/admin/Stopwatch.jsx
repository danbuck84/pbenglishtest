import { useState, useEffect } from "react";

export default function Stopwatch({ startTime }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-mono text-lg font-bold border border-indigo-100 shadow-sm">
      <span>⏱️</span>
      <span>{formatTime(elapsed)}</span>
    </div>
  );
}
