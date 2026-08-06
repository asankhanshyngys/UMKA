"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
    Difficulty,
    CourseStatus,
} from "@/generated/prisma/client";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function updateCourse(
    id: string,
    formData: FormData
) {
    if (!await getCurrentAdmin()) throw new Error("Unauthorized");

    const title =
        formData.get("title") as string;


    const description =
        formData.get("description") as string;


    const price =
        Number(formData.get("price"));


    const difficulty =
        formData.get("difficulty") as Difficulty;


    const status =
        formData.get("status") as CourseStatus;



    await prisma.course.update({

        where:{
            id,
        },

        data:{

            title,

            slug: title
                .toLowerCase()
                .replaceAll(" ","-"),

            description,

            price,

            difficulty,

            status,

        },

    });



    revalidatePath("/admin/courses");

    redirect("/admin/courses");
}
