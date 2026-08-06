import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
    if (!await getCurrentAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    if (!await getCurrentAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
