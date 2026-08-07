"use server";

import { QuestionType } from "@/generated/prisma/client";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const categories = new Set(["GRAMMAR", "VOCABULARY", "LISTENING", "SPEAKING", "WRITING", "MIXED"]);

async function ensureAdmin() {
  if (!await getCurrentAdmin()) throw new Error("Unauthorized");
}

function refresh(videoId: string) {
  revalidatePath(`/admin/videos/${videoId}/practice`);
}

export async function createPractice(videoId: string, formData: FormData) {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  if (!title || !categories.has(category)) throw new Error("A title and valid category are required.");
  const video = await prisma.video.findUnique({ where: { id: videoId }, select: { moduleId: true } });
  if (!video) throw new Error("Video not found.");
  await prisma.practice.create({ data: { title, category, moduleId: video.moduleId, videoId } });
  refresh(videoId);
}

export async function updatePractice(practiceId: string, videoId: string, formData: FormData) {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  if (!title || !categories.has(category)) throw new Error("A title and valid category are required.");
  await prisma.practice.updateMany({ where: { id: practiceId, videoId }, data: { title, category } });
  refresh(videoId);
}

export async function createSection(practiceId: string, videoId: string, formData: FormData) {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Section title is required.");
  const last = await prisma.practiceSection.findFirst({ where: { practiceId }, orderBy: { order: "desc" } });
  await prisma.practiceSection.create({ data: { title, order: (last?.order ?? 0) + 1, practiceId } });
  refresh(videoId);
}

export async function createQuestion(sectionId: string, videoId: string, formData: FormData) {
  await ensureAdmin();
  const text = String(formData.get("text") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const audioUrl = String(formData.get("audioUrl") ?? "").trim();
  const answers = String(formData.get("answers") ?? "").split("\n").map((answer) => answer.trim()).filter(Boolean);
  const correctIndex = Number(formData.get("correctIndex"));
  if (!text || !Object.values(QuestionType).includes(type as QuestionType)) throw new Error("Question text and type are required.");
  if (answers.length === 0) throw new Error("Add at least one answer or expected response.");
  if (!Number.isInteger(correctIndex) || correctIndex < 1 || correctIndex > answers.length) throw new Error("Choose the correct answer number.");
  const previous = await prisma.question.findFirst({ where: { sectionId }, orderBy: { order: "desc" } });
  const question = await prisma.question.create({ data: { text, audioUrl: audioUrl || null, type: type as QuestionType, order: (previous?.order ?? 0) + 1, sectionId } });
  await prisma.answer.createMany({ data: answers.map((answer, index) => ({ text: answer, correct: type === "MATCHING" || index === correctIndex - 1, questionId: question.id })) });
  refresh(videoId);
}

export async function deletePractice(practiceId: string, videoId: string) {
  await ensureAdmin();
  await prisma.practice.deleteMany({ where: { id: practiceId, videoId } });
  refresh(videoId);
}

export async function deleteQuestion(questionId: string, videoId: string) {
  await ensureAdmin();
  await prisma.question.delete({ where: { id: questionId } });
  refresh(videoId);
}

export async function updateQuestion(questionId: string, videoId: string, formData: FormData) {
  await ensureAdmin();
  const text = String(formData.get("text") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const audioUrl = String(formData.get("audioUrl") ?? "").trim();
  const answers = String(formData.get("answers") ?? "").split("\n").map((answer) => answer.trim()).filter(Boolean);
  const correctIndex = Number(formData.get("correctIndex"));
  if (!text || !Object.values(QuestionType).includes(type as QuestionType) || answers.length === 0) throw new Error("Question details are incomplete.");
  if (!Number.isInteger(correctIndex) || correctIndex < 1 || correctIndex > answers.length) throw new Error("Choose the correct answer number.");
  const question = await prisma.question.findFirst({ where: { id: questionId, section: { practice: { videoId } } } });
  if (!question) throw new Error("Question not found.");
  await prisma.$transaction([
    prisma.question.update({ where: { id: question.id }, data: { text, audioUrl: audioUrl || null, type: type as QuestionType } }),
    prisma.answer.deleteMany({ where: { questionId: question.id } }),
    prisma.answer.createMany({ data: answers.map((answer, index) => ({ text: answer, correct: type === "MATCHING" || index === correctIndex - 1, questionId: question.id })) }),
  ]);
  refresh(videoId);
}

export async function moveQuestion(questionId: string, videoId: string, direction: "up" | "down") {
  await ensureAdmin();
  const question = await prisma.question.findFirst({ where: { id: questionId, section: { practice: { videoId } } } });
  if (!question) throw new Error("Question not found.");
  const neighbor = await prisma.question.findFirst({ where: { sectionId: question.sectionId, ...(direction === "up" ? { order: { lt: question.order } } : { order: { gt: question.order } }) }, orderBy: { order: direction === "up" ? "desc" : "asc" } });
  if (!neighbor) return;
  await prisma.$transaction([prisma.question.update({ where: { id: question.id }, data: { order: neighbor.order } }), prisma.question.update({ where: { id: neighbor.id }, data: { order: question.order } })]);
  refresh(videoId);
}
