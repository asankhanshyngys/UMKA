import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache-tags";

const getPublicCourses = unstable_cache(
    async () => prisma.course.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        select: {
            id: true, title: true, slug: true, description: true, thumbnail: true,
            price: true, oldPrice: true, difficulty: true,
            instructor: { select: { id: true, name: true, bio: true, avatarUrl: true } },
            category: { select: { id: true, name: true, description: true } },
            modules: { select: { id: true, title: true, order: true }, where: { deletedAt: null }, orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "desc" },
    }),
    ["public-courses-api"],
    { tags: [CACHE_TAGS.courses], revalidate: 300 },
);

export async function GET() {

    try {

        const courses = await getPublicCourses();


        return NextResponse.json(courses, {
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
            },
        });


    } catch {


        return NextResponse.json(
            {
                error: "Failed to fetch courses",
            },
            {
                status:500,
            }
        );

    }

}
