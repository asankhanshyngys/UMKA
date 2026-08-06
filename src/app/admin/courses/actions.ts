"use server";


import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
    Difficulty,
    CourseStatus,
} from "@/generated/prisma/client";

export async function deleteCourse(id:string) {
    await prisma.course.update({

        where:{
            id,
        },

        data:{
            deletedAt: new Date(),
        },

    });


    revalidatePath("/admin/courses");

}


export async function createCourse(formData: FormData){


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

}