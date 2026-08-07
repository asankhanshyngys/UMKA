"use client";

import { useState } from "react";
import type { LearnerPractice, LearnerQuestion } from "@/lib/practice-presentation";

export type LessonPracticeData = LearnerPractice;

export function LessonPractice({ practices, completedPracticeIds, onCompleted }: { practices: LessonPracticeData[]; completedPracticeIds: string[]; onCompleted: (practiceId: string) => void }) {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  if (practices.length === 0) return null;

  function updateResponse(questionId: string, value: string) { setResponses((current) => ({ ...current, [questionId]: value })); }
  async function submitPractice(practice: LessonPracticeData) {
    setSubmitting(practice.id); setResults((current) => ({ ...current, [practice.id]: "" }));
    try { const questionIds = practice.sections.flatMap((section) => section.questions.map((question) => question.id)); const answers = Object.fromEntries(questionIds.map((questionId) => [questionId, responses[questionId] ?? ""])); const response = await fetch(`/api/practices/${practice.id}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) }); const data = await response.json() as { score?: number; correct?: number; total?: number; error?: string }; if (!response.ok) throw new Error(data.error ?? "Unable to save your result."); setResults((current) => ({ ...current, [practice.id]: `Saved: ${data.score}% (${data.correct}/${data.total})` })); onCompleted(practice.id); } catch (error) { setResults((current) => ({ ...current, [practice.id]: error instanceof Error ? error.message : "Unable to save your result." })); } finally { setSubmitting(null); }
  }

  function questionInput(question: LearnerQuestion) {
    const selectedWords = responses[question.id]?.split(" ").filter(Boolean) ?? [];
    const availableWords = [...question.options];
    for (const selected of selectedWords) { const index = availableWords.indexOf(selected); if (index >= 0) availableWords.splice(index, 1); }
    const isChoice = ["MULTIPLE_CHOICE", "TRUE_FALSE", "LISTENING"].includes(question.type);
    if (question.type === "FLASHCARD") return <div className="mt-3"><button onClick={() => setFlipped((current) => ({ ...current, [question.id]: !current[question.id] }))} className="min-h-28 w-full rounded-xl border border-dashed border-border bg-card p-4 text-center"><span className="block text-xs text-foreground-subtle">{flipped[question.id] ? "Answer" : "Tap to reveal"}</span><span className="mt-2 block text-lg font-semibold">{flipped[question.id] ? (question.flashcardAnswer ?? "") : question.text}</span></button><button onClick={() => updateResponse(question.id, "reviewed")} className="mt-3 rounded border border-border px-3 py-2 text-sm">Mark as learned</button></div>;
    if (question.type === "MATCHING") return <div className="mt-3 grid gap-2">{question.matching?.prompts.map((prompt) => { let matches: Record<string, string> = {}; try { matches = JSON.parse(responses[question.id] ?? "{}"); } catch {} return <label key={prompt} className="grid grid-cols-2 items-center gap-3 text-sm"><span>{prompt}</span><select value={matches[prompt] ?? ""} onChange={(event) => updateResponse(question.id, JSON.stringify({ ...matches, [prompt]: event.target.value }))} className="rounded border border-border bg-card p-2"><option value="">Choose…</option>{question.matching?.options.map((option) => <option key={option}>{option}</option>)}</select></label>; })}</div>;
    if (question.type === "WORD_ORDER") return <div className="mt-3"><div className="min-h-12 rounded border border-border bg-card p-2 text-sm">{selectedWords.join(" ") || "Build the sentence here"}</div><div className="mt-2 flex flex-wrap gap-2">{availableWords.map((word, index) => <button key={`${word}-${index}`} onClick={() => updateResponse(question.id, [...selectedWords, word].join(" "))} className="rounded border border-border bg-card px-3 py-2 text-sm">{word}</button>)}</div><button onClick={() => updateResponse(question.id, "")} className="mt-2 text-xs text-foreground-muted underline">Clear</button></div>;
    if (isChoice) return <div className="mt-3 grid gap-2">{question.options.map((option, index) => <label key={`${option}-${index}`} className="flex cursor-pointer items-center gap-2 text-sm"><input type="radio" name={question.id} value={option} onChange={() => updateResponse(question.id, option)} />{option}</label>)}</div>;
    return <input value={responses[question.id] ?? ""} onChange={(event) => updateResponse(question.id, event.target.value)} placeholder="Your answer" className="mt-3 w-full rounded border border-border bg-card p-2 text-sm" />;
  }

  return <section className="mt-6 space-y-4"><h2 className="font-serif text-2xl">Practice after the lesson</h2>{practices.map((practice) => <article key={practice.id} className="rounded-2xl border border-border bg-card p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-accent">{practice.category}</p><h3 className="mt-1 text-lg font-semibold">{practice.title}</h3></div>{completedPracticeIds.includes(practice.id) && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Completed</span>}</div>{practice.sections.map((section) => <div key={section.id} className="mt-5 space-y-4"><h4 className="font-medium">{section.title}</h4>{section.questions.map((question) => <div key={question.id} className="rounded-xl bg-background p-4"><p className="text-xs font-medium text-accent">{question.type.replaceAll("_", " ")}</p><p className="mt-1 text-sm font-medium">{question.text}</p>{question.type === "LISTENING" && question.audioUrl && <audio className="mt-3 w-full" controls src={question.audioUrl}>Your browser does not support audio.</audio>}{questionInput(question)}</div>)}</div>)}<button disabled={submitting === practice.id} onClick={() => submitPractice(practice)} className="mt-5 rounded bg-accent px-4 py-2 text-sm text-white disabled:opacity-60">{submitting === practice.id ? "Saving…" : "Complete practice"}</button>{results[practice.id] && <p className="mt-2 text-sm text-foreground-muted">{results[practice.id]}</p>}</article>)}</section>;
}
