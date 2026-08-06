import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


const MOCK_USER_ID = "student-demo-id";


export async function GET(
    request: Request,
    context: {
        params: Promise<{ id: string }>
    }
) {

    const { id } = await context.params;


    const course = await prisma.course.findUnique({

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

    });



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



    const purchases = await prisma.coursePurchase.findFirst({

        where: {

            userId: MOCK_USER_ID,

            courseId: id,

            status: "COMPLETED",

        },

    });



    const hasAccess = Boolean(purchases);



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