"use server";


import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import {
    Difficulty,
    CourseStatus,
} from "@/generated/prisma/client";
import { getCurrentAdmin } from "@/lib/auth";

async function ensureAdmin() {
    if (!await getCurrentAdmin()) throw new Error("Unauthorized");
}

export async function deleteCourse(id:string) {
    await ensureAdmin();
    await prisma.course.update({

        where:{
            id,
        },

        data:{
            deletedAt: new Date(),
        },

    });


    revalidatePath("/admin/courses");
    revalidateTag("courses", { expire: 0 });

}


export async function createCourse(formData: FormData){
    await ensureAdmin();


    const title = formData.get("title") as string;


    const price = Number(
        formData.get("price")
    );


    const instructorId =
        formData.get("instructorId") as string;


    const categoryId =
        formData.get("categoryId") as string;


    const difficulty =
        formData.get("difficulty") as Difficulty;


    const status =
        formData.get("status") as CourseStatus;

    const slug = title
        .toLowerCase()
        .replaceAll(" ", "-");


    const description =
        formData.get("description") as string;


    await prisma.course.create({

        data: {

            title,

            slug,

            description,

            price,

            difficulty,

            status,

            instructor: {
                connect: {
                    id: instructorId,
                },
            },


            category: {
                connect: {
                    id: categoryId,
                },
            },

        }

    });

    revalidatePath("/admin/courses");
    revalidateTag("courses", { expire: 0 });

}
