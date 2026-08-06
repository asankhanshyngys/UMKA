import "dotenv/config";
import bcrypt from "bcrypt";

import {
    PrismaClient,
    UserRole,
    CourseStatus,
    Difficulty,
    SubscriptionPlan,
    SubscriptionStatus,
    ResourceType,
    QuestionType,
    PaymentStatus,
} from "../src/generated/prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";


const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});


const prisma = new PrismaClient({
    adapter,
});


async function main() {
    const password = await bcrypt.hash("123456", 10);

    console.log("🌱 Seeding started...");


    // =====================
    // ADMIN USER
    // =====================

    const admin = await prisma.user.create({
        data: {
            email: "admin@umka.kz",
            name: "Admin",
            password,
            role: UserRole.ADMIN,
        },
    });

    // =====================
    // STUDENT
    // =====================

    const user = await prisma.user.create({
        data: {
            email: "student@test.com",
            name: "Test Student",
            password,
        },
    });


    // =====================
    // INSTRUCTOR
    // =====================

    const instructor = await prisma.instructor.create({
        data: {
            name: "John Teacher",
            bio: "English instructor",
        },
    });



    // =====================
    // CATEGORY
    // =====================

    const englishCategory = await prisma.category.create({
        data: {
            name: "English",
            description: "English language courses",
        },
    });


    const grammarCategory = await prisma.category.create({
        data: {
            name: "Grammar",
            description: "Grammar lessons",
        },
    });


    const speakingCategory = await prisma.category.create({
        data: {
            name: "Speaking",
            description: "Speaking practice",
        },
    });



    // =====================
    // COURSE
    // =====================

    const course = await prisma.course.create({
        data: {
            title: "English Grammar Beginner",
            slug: "english-grammar-beginner",

            description:
                "Basic English grammar course",

            price: 29990,

            difficulty: Difficulty.BEGINNER,

            status: CourseStatus.PUBLISHED,


            instructorId: instructor.id,

            categoryId: englishCategory.id,
        },
    });



    // =====================
    // MODULE
    // =====================

    const courseModule = await prisma.module.create({
        data: {

            title: "Present Simple",

            description:
                "Learn present simple tense",

            price: 9990,

            order: 1,

            courseId: course.id,
        },
    });



    // =====================
    // VIDEO
    // =====================

    const video = await prisma.video.create({
        data: {

            title: "Present Simple Explained",

            description:
                "Lesson about Present Simple",

            storageKey:
                "videos/present-simple.mp4",

            duration: 900,

            price: 2990,

            order: 1,

            isFreePreview: true,

            moduleId: courseModule.id,
        },
    });



    // =====================
    // RESOURCE
    // =====================

    await prisma.resource.create({
        data: {

            title: "Grammar PDF",

            type: ResourceType.PDF,

            storageKey:
                "resources/grammar.pdf",

            moduleId: courseModule.id,
        },
    });



    // =====================
    // PRACTICE
    // =====================


    const practice = await prisma.practice.create({

        data: {

            title: "Grammar Practice",

            moduleId: courseModule.id,

        },

    });



    const section =
        await prisma.practiceSection.create({

            data: {

                title: "Present Simple Questions",

                order: 1,

                practiceId: practice.id,

            },

        });



    const question =
        await prisma.question.create({

            data: {

                text:
                    "Choose correct answer: I ___ English",

                type:
                QuestionType.MULTIPLE_CHOICE,

                sectionId: section.id,

            },

        });



    await prisma.answer.createMany({

        data: [

            {
                text: "study",
                correct: true,
                questionId: question.id,
            },

            {
                text: "studies",
                correct: false,
                questionId: question.id,
            },

            {
                text: "studied",
                correct: false,
                questionId: question.id,
            },

        ],

    });



    // =====================
    // SUBSCRIPTION
    // =====================


    await prisma.subscription.create({

        data: {

            userId: user.id,

            plan:
            SubscriptionPlan.THREE_MONTHS,

            price: 24990,

            status:
            SubscriptionStatus.ACTIVE,

            startsAt:
                new Date(),

            expiresAt:
                new Date(
                    Date.now() + 90 * 24 * 60 * 60 * 1000
                ),

        },

    });



    // =====================
    // PLATFORM SETTINGS
    // =====================


    await prisma.platformSettings.create({

        data: {

            oneMonthSubscription: 9990,

            threeMonthSubscription: 24990,

            sixMonthSubscription: 44990,

        },

    });



    // =====================
    // PAYMENT
    // =====================


    await prisma.payment.create({

        data: {

            userId: user.id,

            amount: 24990,

            status:
            PaymentStatus.SUCCESS,

            provider:
                "Kaspi",

            transactionId:
                "TEST-001",

        },

    });



    console.log("✅ Seed completed");

}


main()
    .catch((e)=>{

        console.error(e);

        process.exit(1);

    })

    .finally(async()=>{

        await prisma.$disconnect();

    });