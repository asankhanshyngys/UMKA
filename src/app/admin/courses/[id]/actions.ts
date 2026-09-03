"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
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
    const oldPriceValue = String(formData.get("oldPrice") ?? "").trim();
    const oldPrice = oldPriceValue ? Number(oldPriceValue) : null;


    const difficulty =
        formData.get("difficulty") as Difficulty;


    const status =
        formData.get("status") as CourseStatus;

    const thumbnail = String(formData.get("thumbnail") ?? "").trim() || null;



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

            oldPrice,

            difficulty,

            status,

            thumbnail,

        },

    });



    revalidatePath("/admin/courses");
    revalidateTag("courses", { expire: 0 });

    redirect("/admin/courses");
}
