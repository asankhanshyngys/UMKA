import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CreateModule from "./CreateModule";
import ModuleActions from "./ModuleActions";
import Link from "next/link";

export default async function CourseContentPage({
                                                    params,
                                                }: {
    params: Promise<{ id: string }>;
}) {

    const { id } = await params;

    const course = await prisma.course.findUnique({
        where: {
            id,
        },
        include: {
            modules: {
                orderBy: {
                    order: "asc",
                },
            },
        },
    });

    if (!course) {
        notFound();
    }

    return (
        <div className="p-10">

            <h1 className="text-3xl font-bold">
                {course.title}
            </h1>

            <h2 className="text-xl mt-8 font-semibold">
                Modules
            </h2>

            <CreateModule
                courseId={course.id}
            />

            <div className="mt-5 space-y-4">

                {course.modules.map((module) => (

                    <div
                        key={module.id}
                        className="border rounded p-4"
                    >

                        <div className="flex items-center justify-between">

                            <h3 className="font-bold">
                                {module.title}
                            </h3>

                            <div className="flex gap-2">

                                <Link
                                    href={`/admin/modules/${module.id}`}
                                    className="rounded bg-blue-600 px-4 py-2 text-white"
                                >
                                    Manage
                                </Link>

                                <ModuleActions
                                    moduleId={module.id}
                                    courseId={course.id}
                                />

                            </div>

                        </div>


                        <p>
                            {module.description}
                        </p>

                    </div>

                ))}

            </div>

        </div>
    );
}