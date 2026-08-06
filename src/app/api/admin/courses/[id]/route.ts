import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const course = await prisma.course.findUnique({
        where: {
            id,
        },
        include: {
            instructor: true,
            category: true,
            modules: true,
        },
    });

    if (!course) {
        return NextResponse.json(
            { error: "Course not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(course);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const body = await request.json();

    const course = await prisma.course.update({
        where: {
            id,
        },
        data: body,
    });

    return NextResponse.json(course);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    await prisma.course.delete({
        where: {
            id,
        },
    });

    return NextResponse.json({
        message: "Course deleted",
    });
}