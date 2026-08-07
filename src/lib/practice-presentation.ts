export type LearnerQuestion = {
  id: string;
  text: string;
  audioUrl: string | null;
  type: string;
  options: string[];
  flashcardAnswer?: string;
  matching?: { prompts: string[]; options: string[] };
};

export type LearnerPractice = {
  id: string;
  title: string;
  category: string;
  sections: { id: string; title: string; questions: LearnerQuestion[] }[];
};

type StoredAnswer = { text: string; correct: boolean };
type StoredQuestion = { id: string; text: string; audioUrl: string | null; type: string; answers: StoredAnswer[] };
type StoredPractice = { id: string; title: string; category: string; sections: { id: string; title: string; questions: StoredQuestion[] }[] };

function splitPair(text: string) {
  const [left, right] = text.split(/\s*(?:—|-)\s*/, 2).map((part) => part?.trim());
  return left && right ? { left, right } : null;
}

export function toLearnerPractices(practices: StoredPractice[]): LearnerPractice[] {
  return practices.map((practice) => ({ ...practice, sections: practice.sections.map((section) => ({ ...section, questions: section.questions.map((question) => {
    const correctAnswers = question.answers.filter((answer) => answer.correct);
    const answerTexts = (correctAnswers.length > 0 ? correctAnswers : question.answers).map((answer) => answer.text);
    const base: LearnerQuestion = { id: question.id, text: question.text, audioUrl: question.audioUrl, type: question.type, options: question.answers.map((answer) => answer.text) };
    if (question.type === "FLASHCARD") return { ...base, flashcardAnswer: answerTexts[0] };
    if (question.type === "WORD_ORDER") return { ...base, options: (answerTexts[0] ?? "").split(/\s+/).filter(Boolean).sort() };
    if (question.type === "MATCHING") {
      const pairs = answerTexts.map(splitPair).filter((pair): pair is { left: string; right: string } => Boolean(pair));
      return { ...base, options: [], matching: { prompts: pairs.map((pair) => pair.left), options: pairs.map((pair) => pair.right).sort() } };
    }
    return base;
  }) })) }));
}
