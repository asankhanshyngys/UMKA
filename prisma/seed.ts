import "dotenv/config";
import bcrypt from "bcrypt";
import {
  PrismaClient,
  CourseStatus,
  Difficulty,
  PaymentStatus,
  QuestionType,
  ResourceType,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed the database.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const password = await bcrypt.hash("123456", 10);
  console.log("🌱 Seeding UMKA development data...");

  await prisma.user.upsert({
    where: { email: "admin@umka.kz" },
    update: { name: "Admin", password, role: UserRole.ADMIN },
    create: { email: "admin@umka.kz", name: "Admin", password, role: UserRole.ADMIN },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@test.com" },
    update: { name: "Test Student", password },
    create: { email: "student@test.com", name: "Test Student", password },
  });

  let instructor = await prisma.instructor.findFirst({ where: { name: "John Teacher" } });
  if (!instructor) {
    instructor = await prisma.instructor.create({ data: { name: "John Teacher", bio: "English instructor" } });
  }

  const englishCategory = await prisma.category.upsert({
    where: { name: "English" },
    update: { description: "English language courses" },
    create: { name: "English", description: "English language courses" },
  });

  await Promise.all([
    prisma.category.upsert({ where: { name: "Grammar" }, update: { description: "Grammar lessons" }, create: { name: "Grammar", description: "Grammar lessons" } }),
    prisma.category.upsert({ where: { name: "Speaking" }, update: { description: "Speaking practice" }, create: { name: "Speaking", description: "Speaking practice" } }),
  ]);

  const course = await prisma.course.upsert({
    where: { slug: "english-grammar-beginner" },
    update: {
      title: "English Grammar Beginner", description: "Basic English grammar course", price: 29990,
      difficulty: Difficulty.BEGINNER, status: CourseStatus.PUBLISHED, deletedAt: null,
      instructorId: instructor.id, categoryId: englishCategory.id,
    },
    create: {
      title: "English Grammar Beginner", slug: "english-grammar-beginner", description: "Basic English grammar course",
      price: 29990, difficulty: Difficulty.BEGINNER, status: CourseStatus.PUBLISHED,
      instructorId: instructor.id, categoryId: englishCategory.id,
    },
  });

  let courseModule = await prisma.module.findFirst({ where: { courseId: course.id, title: "Present Simple" } });
  if (courseModule) {
    courseModule = await prisma.module.update({ where: { id: courseModule.id }, data: { description: "Learn present simple tense", price: 9990, order: 1, deletedAt: null } });
  } else {
    courseModule = await prisma.module.create({ data: { title: "Present Simple", description: "Learn present simple tense", price: 9990, order: 1, courseId: course.id } });
  }

  let video = await prisma.video.findFirst({ where: { moduleId: courseModule.id, title: "Present Simple Explained" } });
  if (video) {
    video = await prisma.video.update({ where: { id: video.id }, data: { description: "Lesson about Present Simple", storageKey: "videos/present-simple.mp4", duration: 900, price: 2990, order: 1, isFreePreview: true, deletedAt: null } });
  } else {
    video = await prisma.video.create({ data: { title: "Present Simple Explained", description: "Lesson about Present Simple", storageKey: "videos/present-simple.mp4", duration: 900, price: 2990, order: 1, isFreePreview: true, moduleId: courseModule.id } });
  }

  const resource = await prisma.resource.findFirst({ where: { moduleId: courseModule.id, title: "Grammar PDF" } });
  if (!resource) await prisma.resource.create({ data: { title: "Grammar PDF", type: ResourceType.PDF, storageKey: "resources/grammar.pdf", moduleId: courseModule.id } });

  let practice = await prisma.practice.findFirst({ where: { moduleId: courseModule.id, title: "Grammar Practice" } });
  if (!practice) practice = await prisma.practice.create({ data: { title: "Grammar Practice", moduleId: courseModule.id } });
  let section = await prisma.practiceSection.findFirst({ where: { practiceId: practice.id, title: "Present Simple Questions" } });
  if (!section) section = await prisma.practiceSection.create({ data: { title: "Present Simple Questions", order: 1, practiceId: practice.id } });
  let question = await prisma.question.findFirst({ where: { sectionId: section.id, text: "Choose correct answer: I ___ English" } });
  if (!question) question = await prisma.question.create({ data: { text: "Choose correct answer: I ___ English", type: QuestionType.MULTIPLE_CHOICE, sectionId: section.id } });
  if (await prisma.answer.count({ where: { questionId: question.id } }) === 0) {
    await prisma.answer.createMany({ data: [
      { text: "study", correct: true, questionId: question.id },
      { text: "studies", correct: false, questionId: question.id },
      { text: "studied", correct: false, questionId: question.id },
    ] });
  }

  const startsAt = new Date();
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const subscription = await prisma.subscription.findFirst({ where: { userId: student.id, plan: SubscriptionPlan.THREE_MONTHS } });
  if (subscription) {
    await prisma.subscription.update({ where: { id: subscription.id }, data: { price: 24990, status: SubscriptionStatus.ACTIVE, startsAt, expiresAt } });
  } else {
    await prisma.subscription.create({ data: { userId: student.id, plan: SubscriptionPlan.THREE_MONTHS, price: 24990, status: SubscriptionStatus.ACTIVE, startsAt, expiresAt } });
  }

  const settings = await prisma.platformSettings.findFirst();
  const settingsData = { oneMonthSubscription: 9990, threeMonthSubscription: 24990, sixMonthSubscription: 44990 };
  if (settings) await prisma.platformSettings.update({ where: { id: settings.id }, data: settingsData });
  else await prisma.platformSettings.create({ data: settingsData });

  const payment = await prisma.payment.findFirst({ where: { transactionId: "TEST-001" } });
  const paymentData = { userId: student.id, amount: 24990, status: PaymentStatus.SUCCESS, provider: "Kaspi", transactionId: "TEST-001" };
  if (payment) await prisma.payment.update({ where: { id: payment.id }, data: paymentData });
  else await prisma.payment.create({ data: paymentData });

  console.log("✅ Seed completed. It is safe to run again.");
}

main()
  .catch((error) => { console.error(error); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
