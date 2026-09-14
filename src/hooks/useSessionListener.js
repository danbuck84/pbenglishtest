/**
 * Custom hook that subscribes to the Firestore session document
 * and returns its current state. Used by the Display View.
 */

import { useState, useEffect } from "react";
import { subscribeToSession } from "../services/firestore";

/**
 * @returns {{ status: string, candidateName: string, finalLevel: string, studyPlan: string, assessmentId: string }}
 */
export function useSessionListener() {
  const [session, setSession] = useState({
    status: "idle",
    candidateName: "",
    finalLevel: "",
    studyPlan: "",
    assessmentId: "",
  });

  useEffect(() => {
    const unsubscribe = subscribeToSession((data) => {
      setSession(data);
    });

    return () => unsubscribe();
  }, []);

  return session;
}
