import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const getCourseById = unstable_cache(
    async (id: string) => prisma.course.findUnique({
        where: {
            id,
        },

        include: {

            instructor: true,

            category: true,


            modules: {

                orderBy: {
                    order: "asc",
                },


                include: {

                    videos: {

                        orderBy: {
                            order: "asc",
                        },

                    },


                    practices: true,

                    resources: true,

                },

            },

        },
    }),
    ["course-detail"],
    { tags: ["courses"], revalidate: 300 },
);


export async function GET(
    request: Request,
    context: {
        params: Promise<{ id: string }>
    }
) {

    const { id } = await context.params;


    const course = await getCourseById(id);



    if (!course) {

        return NextResponse.json(
            {
                error: "Course not found",
            },
            {
                status: 404,
            }
        );

    }



    const user = await getCurrentUser();
    const now = new Date();
    const purchases = user ? await prisma.coursePurchase.findFirst({

        where: {

            userId: user.id,

            courseId: id,

            status: "COMPLETED",

            expiresAt: { gt: now },
        },
    }) : null;

    const subscription = user ? await prisma.subscription.findFirst({
        where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: now } },
    }) : null;



    const hasAccess = user?.role === "ADMIN" || Boolean(purchases) || Boolean(subscription);



    const protectedCourse = {


        ...course,


        modules: course.modules.map((module) => ({


            ...module,


            videos: module.videos.map((video) => {


                if (hasAccess) {

                    return video;

                }



                if (video.isFreePreview) {

                    return video;

                }



                return {

                    ...video,

                    storageKey: null,

                    locked: true,

                };


            }),


        })),


    };



    return NextResponse.json({

        course: protectedCourse,

        access: hasAccess,

    });


}
