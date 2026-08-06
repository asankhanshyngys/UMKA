import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const courses = await prisma.course.findMany({
        include: {
            instructor: true,
            category: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return NextResponse.json(courses);
}

export async function POST(req: Request) {

    const body = await req.json();

    const {
        title,
        slug,
        description,
        price,
        difficulty,
        instructorId,
        categoryId,
    } = body;

    const course = await prisma.course.create({
        data: {
            title,
            slug,
            description,
            price,
            difficulty,
            instructorId,
            categoryId,
            status: "DRAFT",
        },
    });

    return NextResponse.json(course, {
        status: 201,
    });
}