import assert from "node:assert/strict";
import test from "node:test";
import { hasLessonAccess, isLessonLocked, scorePractice } from "../src/lib/learning";
import { toLearnerPractices } from "../src/lib/practice-presentation";

test("a standalone lesson or module purchase grants lesson access", () => {
  assert.equal(hasLessonAccess({ isAdmin: false, hasSubscription: false, hasCoursePurchase: false, hasModulePurchase: false, hasVideoPurchase: true }), true);
  assert.equal(hasLessonAccess({ isAdmin: false, hasSubscription: false, hasCoursePurchase: false, hasModulePurchase: true, hasVideoPurchase: false }), true);
  assert.equal(hasLessonAccess({ isAdmin: false, hasSubscription: false, hasCoursePurchase: false, hasModulePurchase: false, hasVideoPurchase: false }), false);
});

test("the next lesson stays locked until the previous lesson practices are complete", () => {
  const lessons = [{ practices: [{ id: "practice-1" }] }, { practices: [{ id: "practice-2" }] }];
  assert.equal(isLessonLocked(lessons, 0, []), false);
  assert.equal(isLessonLocked(lessons, 1, []), true);
  assert.equal(isLessonLocked(lessons, 1, ["practice-1"]), false);
  assert.equal(isLessonLocked(lessons, 1, [], true), false);
});

test("practice scoring handles choice, flashcard, and matching tasks", () => {
  const result = scorePractice([
    { id: "choice", type: "MULTIPLE_CHOICE", answers: [{ text: "study", correct: true }, { text: "studies", correct: false }] },
    { id: "card", type: "FLASHCARD", answers: [{ text: "wake up", correct: true }] },
    { id: "match", type: "MATCHING", answers: [{ text: "book — книга", correct: true }, { text: "pen — ручка", correct: true }] },
  ], { choice: "study", card: "reviewed", match: JSON.stringify({ book: "книга", pen: "ручка" }) });
  assert.deepEqual(result, { correct: 3, total: 3, score: 100 });
});

test("learner practice data excludes correct answers", () => {
  const practices = toLearnerPractices([{ id: "practice", title: "Test", category: "GRAMMAR", sections: [{ id: "section", title: "Questions", questions: [{ id: "question", text: "Choose", audioUrl: null, type: "MULTIPLE_CHOICE", answers: [{ text: "Correct", correct: true }, { text: "Wrong", correct: false }] }] }] }]);
  const serialized = JSON.stringify(practices);
  assert.equal(serialized.includes("correct"), false);
  assert.deepEqual(practices[0].sections[0].questions[0].options, ["Correct", "Wrong"]);
});
