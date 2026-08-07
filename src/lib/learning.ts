export type AnswerForScoring = { text: string; correct: boolean };
export type QuestionForScoring = { id: string; type: string; answers: AnswerForScoring[] };
export type LessonForProgress = { practices: { id: string }[] };

export function hasLessonAccess(access: { isAdmin: boolean; hasSubscription: boolean; hasCoursePurchase: boolean; hasModulePurchase: boolean; hasVideoPurchase: boolean }) {
  return access.isAdmin || access.hasSubscription || access.hasCoursePurchase || access.hasModulePurchase || access.hasVideoPurchase;
}

export function previousLessonPracticeIds(lessons: LessonForProgress[], lessonIndex: number) {
  return lessonIndex > 0 ? lessons[lessonIndex - 1]?.practices.map((practice) => practice.id) ?? [] : [];
}

export function isLessonLocked(lessons: LessonForProgress[], lessonIndex: number, completedPracticeIds: string[], bypassSequence = false) {
  if (bypassSequence) return false;
  const completed = new Set(completedPracticeIds);
  return previousLessonPracticeIds(lessons, lessonIndex).some((practiceId) => !completed.has(practiceId));
}

export function scorePractice(questions: QuestionForScoring[], responses: Record<string, string>) {
  const correct = questions.filter((question) => {
    const response = responses[question.id]?.trim().toLocaleLowerCase();
    if (question.type === "FLASHCARD") return response === "reviewed";
    if (question.type === "MATCHING") {
      try {
        const matches = JSON.parse(responses[question.id] ?? "{}") as Record<string, string>;
        return question.answers.every((answer) => {
          const [left, right] = answer.text.split(/\s*(?:—|-)\s*/, 2);
          return Boolean(left && right && matches[left] === right);
        });
      } catch { return false; }
    }
    return question.answers.some((answer) => answer.correct && answer.text.trim().toLocaleLowerCase() === response);
  }).length;
  return { correct, total: questions.length, score: questions.length === 0 ? 100 : Math.round((correct / questions.length) * 100) };
}
