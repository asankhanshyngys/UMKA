"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";


export async function createModule(
    courseId: string,
    formData: FormData
) {
    if (!await getCurrentAdmin()) throw new Error("Unauthorized");

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
    if (!await getCurrentAdmin()) throw new Error("Unauthorized");


    await prisma.module.delete({

        where:{
            id: moduleId,
        },

    });


    revalidatePath(
        `/admin/courses/${courseId}/content`
    );

}

export async function moveModule(moduleId: string, courseId: string, direction: "up" | "down") {
    if (!await getCurrentAdmin()) throw new Error("Unauthorized");
    const modules = await prisma.module.findMany({ where: { courseId, deletedAt: null }, orderBy: { order: "asc" }, select: { id: true, order: true } });
    const index = modules.findIndex((courseModule) => courseModule.id === moduleId);
    const neighbor = modules[index + (direction === "up" ? -1 : 1)];
    if (index < 0 || !neighbor) return;
    await prisma.$transaction([
        prisma.module.update({ where: { id: moduleId }, data: { order: neighbor.order } }),
        prisma.module.update({ where: { id: neighbor.id }, data: { order: modules[index].order } }),
    ]);
    revalidatePath(`/admin/courses/${courseId}/content`);
}
