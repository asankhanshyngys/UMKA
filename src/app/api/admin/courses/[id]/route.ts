import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await getCurrentAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;

    const course = await prisma.course.findFirst({
        where: {
            id,
            deletedAt: null,
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
    if (!await getCurrentAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    if (!await getCurrentAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;

    await prisma.course.update({
        where: {
            id,
        },
        data: { deletedAt: new Date() },
    });

    return NextResponse.json({
        message: "Course deleted",
    });
}
