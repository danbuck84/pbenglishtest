/**
 * Firestore service — all database operations live here.
 *
 * Collections:
 *  - candidates          → individual candidate records
 *  - assessments         → completed test history with AI feedback
 *  - app/current_session → singleton that the Display View listens to
 *
 * Every write operation is wrapped with a timeout to prevent the UI
 * from hanging indefinitely if Firestore is unreachable or rules block writes.
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
import { db, isFirebaseConfigured } from "../config/firebase";

// ─── Timeout helper ──────────────────────────────────────────────

const WRITE_TIMEOUT_MS = 10000; // 10 seconds max for any write operation

/**
 * Wraps a promise with a timeout. If the promise doesn't resolve/reject
 * within the given time, the wrapper rejects with a clear error message.
 */
function withTimeout(promise, ms = WRITE_TIMEOUT_MS, label = "Firestore operation") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(
          `${label} expirou após ${ms / 1000}s. ` +
          `Verifique: 1) Firestore está habilitado no Firebase Console, ` +
          `2) Regras de segurança permitem leitura/escrita, ` +
          `3) Variáveis de ambiente estão configuradas no Netlify.`
        )),
        ms
      )
    ),
  ]);
}

/**
 * Guard: throws immediately if Firebase config is missing.
 */
function assertConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase não está configurado. As variáveis de ambiente (VITE_FIREBASE_*) " +
      "não foram encontradas. No Netlify, adicione-as em Site Settings → Environment Variables e faça redeploy."
    );
  }
}

// ─── Singleton session document path ───
const SESSION_DOC_REF = doc(db, "app", "current_session");

// ─── Current Session ─────────────────────────────────────────────

/**
 * Update the current session document (the one the Display View watches).
 * @param {object} data  Partial fields to merge into the session document.
 */
export async function updateSession(data) {
  assertConfigured();
  await withTimeout(
    setDoc(SESSION_DOC_REF, { ...data, updatedAt: serverTimestamp() }, { merge: true }),
    WRITE_TIMEOUT_MS,
    "Atualização da sessão"
  );
}

/**
 * Reset session back to idle (waiting for next candidate).
 */
export async function resetSession() {
  assertConfigured();
  await withTimeout(
    setDoc(SESSION_DOC_REF, {
      status: "idle",
      candidateName: "",
      finalLevel: "",
      studyPlan: "",
      assessmentId: "",
      updatedAt: serverTimestamp(),
    }),
    WRITE_TIMEOUT_MS,
    "Reset da sessão"
  );
}

/**
 * Subscribe to real-time changes on the session document.
 * @param {function} callback  Called with the document data on every change.
 * @returns {function} Unsubscribe function.
 */
export function subscribeToSession(callback) {
  if (!isFirebaseConfigured) {
    console.error("[Firestore] Cannot subscribe — Firebase not configured.");
    callback({ status: "idle" });
    return () => {};
  }

  return onSnapshot(
    SESSION_DOC_REF,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      } else {
        // Document doesn't exist yet — treat as idle
        callback({ status: "idle" });
      }
    },
    (error) => {
      console.error("[Firestore] Session listener error:", error);
      // Don't crash — just keep showing idle
    }
  );
}

// ─── Candidates ──────────────────────────────────────────────────

/**
 * Create a candidate record. Returns the auto-generated document ID.
 */
export async function createCandidate({ name, email = "", phone = "" }) {
  assertConfigured();
  const docRef = await withTimeout(
    addDoc(collection(db, "candidates"), {
      name,
      email,
      phone,
      createdAt: serverTimestamp(),
    }),
    WRITE_TIMEOUT_MS,
    "Registro do candidato"
  );
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
  assertConfigured();
  const docRef = await withTimeout(
    addDoc(collection(db, "assessments"), {
      candidateId,
      candidateName,
      answers,
      multipleChoiceScore,
      finalLevel,
      studyPlan,
      aiFeedback,
      createdAt: serverTimestamp(),
    }),
    WRITE_TIMEOUT_MS,
    "Salvamento da avaliação"
  );
  return docRef.id;
}

/**
 * Fetch a single assessment by its document ID (used by the study plan page).
 */
export async function getAssessment(assessmentId) {
  assertConfigured();
  const snapshot = await withTimeout(
    getDoc(doc(db, "assessments", assessmentId)),
    WRITE_TIMEOUT_MS,
    "Busca da avaliação"
  );
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
}
