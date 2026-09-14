/**
 * Firestore service — all database operations live here.
 *
 * Collections:
 *  - candidates          → individual candidate records
 *  - assessments         → completed test history with AI feedback
 *  - app/current_session → singleton that the Display View listens to
 */

import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

// ─── Singleton session document path ───
const SESSION_DOC_REF = doc(db, "app", "current_session");

// ─── Current Session ─────────────────────────────────────────────

/**
 * Update the current session document (the one the Display View watches).
 * @param {object} data  Partial fields to merge into the session document.
 */
export async function updateSession(data) {
  await setDoc(SESSION_DOC_REF, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Reset session back to idle (waiting for next candidate).
 */
export async function resetSession() {
  await setDoc(SESSION_DOC_REF, {
    status: "idle",
    candidateName: "",
    finalLevel: "",
    studyPlan: "",
    assessmentId: "",
    updatedAt: serverTimestamp(),
  });
}

/**
 * Subscribe to real-time changes on the session document.
 * @param {function} callback  Called with the document data on every change.
 * @returns {function} Unsubscribe function.
 */
export function subscribeToSession(callback) {
  return onSnapshot(SESSION_DOC_REF, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      // Document doesn't exist yet — treat as idle
      callback({ status: "idle" });
    }
  });
}

// ─── Candidates ──────────────────────────────────────────────────

/**
 * Create a candidate record. Returns the auto-generated document ID.
 */
export async function createCandidate({ name, email = "", phone = "" }) {
  const docRef = await addDoc(collection(db, "candidates"), {
    name,
    email,
    phone,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ─── Assessments ─────────────────────────────────────────────────

/**
 * Save a completed assessment. Returns the document ID.
 */
export async function saveAssessment({
  candidateId,
  candidateName,
  answers,
  multipleChoiceScore,
  finalLevel,
  studyPlan,
  aiFeedback,
}) {
  const docRef = await addDoc(collection(db, "assessments"), {
    candidateId,
    candidateName,
    answers,
    multipleChoiceScore,
    finalLevel,
    studyPlan,
    aiFeedback,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Fetch a single assessment by its document ID (used by the study plan page).
 */
export async function getAssessment(assessmentId) {
  const snapshot = await getDoc(doc(db, "assessments", assessmentId));
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
}
