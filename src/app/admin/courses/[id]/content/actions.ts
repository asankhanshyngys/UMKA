"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";


export async function createModule(
    courseId: string,
    formData: FormData
) {

    const title =
        formData.get("title") as string;

    const description =
        formData.get("description") as string;

    const price =
        Number(formData.get("price"));


    const lastModule =
        await prisma.module.findFirst({

            where: {
                courseId,
            },

            orderBy: {
                order: "desc",
            },

        });


    const order =
        lastModule ? lastModule.order + 1 : 1;


    await prisma.module.create({

        data: {

            title,

            description,

            price,

            order,

            courseId,

        },

    });


    revalidatePath(
        `/admin/courses/${courseId}/content`
    );

}



// DELETE MODULE

export async function deleteModule(
    moduleId: string,
    courseId: string
) {


    await prisma.module.delete({

        where:{
            id: moduleId,
        },

    });


    revalidatePath(
        `/admin/courses/${courseId}/content`
    );

}