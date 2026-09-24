/**
 * DisplayPage — the external monitor view at /display.
 *
 * Listens to the Firestore session in real-time and renders:
 *  - WaitingScreen  when status === "idle"
 *  - TestingScreen  when status === "testing"
 *  - ResultsScreen  when status === "finished"
 */

import { useSessionListener } from "../hooks/useSessionListener";
import WaitingScreen from "../components/display/WaitingScreen";
import TestingScreen from "../components/display/TestingScreen";
import EvaluatingScreen from "../components/display/EvaluatingScreen";
import ResultsScreen from "../components/display/ResultsScreen";

export default function DisplayPage() {
  const session = useSessionListener();

  switch (session.status) {
    case "testing":
      return <TestingScreen candidateName={session.candidateName} currentQuestionIndex={session.currentQuestionIndex} />;

    case "evaluating":
      return <EvaluatingScreen candidateName={session.candidateName} />;

    case "finished":
      return (
        <ResultsScreen
          candidateName={session.candidateName}
          finalLevel={session.finalLevel}
          assessmentId={session.assessmentId}
        />
      );

    case "idle":
    default:
      return <WaitingScreen />;
  }
}
