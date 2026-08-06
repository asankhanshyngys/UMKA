import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {

    try {

        const courses = await prisma.course.findMany({

            where: {
                status: "PUBLISHED",
                deletedAt: null,
            },

            include: {

                instructor: true,

                category: true,

                modules: {

                    select: {
                        id: true,
                        title: true,
                        order: true,
                    },

                    orderBy: {
                        order: "asc",
                    },

                },

            },

            orderBy: {
                createdAt: "desc",
            },

        });


        return NextResponse.json(courses);


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
