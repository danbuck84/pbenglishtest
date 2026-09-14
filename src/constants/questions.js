/**
 * Complete question bank for the English Placement Test.
 *
 * Each question has:
 *  - id:            unique identifier (q1–q12)
 *  - level:         CEFR level (A1, A2, B1, B2, C1, C2)
 *  - type:          "multiple_choice" | "free_text"
 *  - questionText:  the English question read aloud by the admin
 *  - options:       (MC only) array of { label, text, isCorrect }
 */

export const QUESTIONS = [
  // ───────────── A1 — Multiple Choice ─────────────
  {
    id: "q1",
    level: "A1",
    type: "multiple_choice",
    questionText: "What do you usually do in the morning?",
    options: [
      { label: "A", text: "I eat breakfast and go to work.", isCorrect: true },
      { label: "B", text: "I goes to work.", isCorrect: false },
      { label: "C", text: "I am eat breakfast.", isCorrect: false },
      { label: "D", text: "I was working.", isCorrect: false },
    ],
  },
  {
    id: "q2",
    level: "A1",
    type: "multiple_choice",
    questionText: "Excuse me, where is the nearest supermarket?",
    options: [
      { label: "A", text: "It is next to the pharmacy.", isCorrect: true },
      { label: "B", text: "He is a doctor.", isCorrect: false },
      { label: "C", text: "I don't like supermarkets.", isCorrect: false },
      { label: "D", text: "They are go to the supermarket.", isCorrect: false },
    ],
  },

  // ───────────── A2 — Multiple Choice ─────────────
  {
    id: "q3",
    level: "A2",
    type: "multiple_choice",
    questionText: "What did you do last weekend?",
    options: [
      { label: "A", text: "I went to the park with my family.", isCorrect: true },
      { label: "B", text: "I go to the park with my family.", isCorrect: false },
      { label: "C", text: "I going to the park.", isCorrect: false },
      { label: "D", text: "I will go to the park.", isCorrect: false },
    ],
  },
  {
    id: "q4",
    level: "A2",
    type: "multiple_choice",
    questionText: "Can you describe your hometown or the city where you live?",
    options: [
      { label: "A", text: "It's a small and quiet city with beautiful parks.", isCorrect: true },
      { label: "B", text: "It has very fast.", isCorrect: false },
      { label: "C", text: "She is very beautiful.", isCorrect: false },
      { label: "D", text: "I live in there for ten years.", isCorrect: false },
    ],
  },

  // ───────────── B1 — Multiple Choice ─────────────
  {
    id: "q5",
    level: "B1",
    type: "multiple_choice",
    questionText: "What are your plans for your next vacation?",
    options: [
      { label: "A", text: "I'm going to visit my relatives in another state.", isCorrect: true },
      { label: "B", text: "I went to the beach.", isCorrect: false },
      { label: "C", text: "I visiting my relatives.", isCorrect: false },
      { label: "D", text: "I will to go to visit them.", isCorrect: false },
    ],
  },
  {
    id: "q6",
    level: "B1",
    type: "multiple_choice",
    questionText: "If your friend has a terrible headache, what should they do?",
    options: [
      { label: "A", text: "If I were them, I would take some medicine and rest.", isCorrect: true },
      { label: "B", text: "I am taking some medicine.", isCorrect: false },
      { label: "C", text: "They should to drink water.", isCorrect: false },
      { label: "D", text: "They took some medicine.", isCorrect: false },
    ],
  },

  // ───────────── B2 — Free Text ─────────────
  {
    id: "q7",
    level: "B2",
    type: "free_text",
    questionText:
      "Do you think technology brings people closer together or makes them more isolated? Why?",
  },
  {
    id: "q8",
    level: "B2",
    type: "free_text",
    questionText:
      "Tell me about a time when you had to overcome a difficult challenge. How did you handle it?",
  },

  // ───────────── C1 — Free Text ─────────────
  {
    id: "q9",
    level: "C1",
    type: "free_text",
    questionText:
      "In your opinion, what is the most pressing environmental or social issue today, and what steps should we take to address it?",
  },
  {
    id: "q10",
    level: "C1",
    type: "free_text",
    questionText:
      "If you could change one major decision you made in the past, what would it be and how do you think it would alter your present life?",
  },

  // ───────────── C2 — Free Text ─────────────
  {
    id: "q11",
    level: "C2",
    type: "free_text",
    questionText:
      "Some argue that true altruism doesn't exist, as people always gain some psychological benefit from helping others. To what extent do you agree with this statement?",
  },
  {
    id: "q12",
    level: "C2",
    type: "free_text",
    questionText:
      "How do you think the concept of \"community\" is changing in an increasingly globalized and digital world? Give specific examples.",
  },
];

/** Convenience — total number of questions */
export const TOTAL_QUESTIONS = QUESTIONS.length;

/** CEFR level descriptions in Portuguese for the results screen */
export const LEVEL_DESCRIPTIONS = {
  A1: "Iniciante — Consegue entender e usar expressões familiares do dia a dia e frases muito simples.",
  A2: "Básico — Consegue se comunicar em tarefas simples e rotineiras sobre assuntos familiares.",
  B1: "Intermediário — Consegue lidar com a maioria das situações encontradas em viagens e descrever experiências.",
  B2: "Intermediário Superior — Consegue interagir com fluência e espontaneidade, produzindo textos claros e detalhados.",
  C1: "Avançado — Consegue usar a língua de forma flexível e eficaz para fins sociais, acadêmicos e profissionais.",
  C2: "Proficiente — Consegue compreender praticamente tudo e se expressar de forma espontânea, fluente e precisa.",
};
