import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditCourse from "./EditCourse";


export default async function EditCoursePage({
                                                 params,
                                             }: {
    params: Promise<{id:string}>
}) {


    const {id} = await params;


    const course =
        await prisma.course.findUnique({

            where:{
                id,
            },

            include:{
                modules:{
                    orderBy:{
                        order:"asc",
                    },
                },
            },

        });

    if(!course){
        notFound();
    }


    return (
        <div className="space-y-8">

            <h1 className="font-serif text-4xl text-foreground">
                Edit Course
            </h1>


            <EditCourse
                course={course}
            />
            <div className="space-y-5">

            <h2 className="font-serif text-2xl font-semibold text-foreground">
                Modules
            </h2>


            <div className="space-y-3">

                {course.modules.map(module=>(

                    <div
                        key={module.id}
                        className="rounded-2xl border border-border bg-card p-5"
                    >

                        <h3 className="font-semibold text-foreground">
                            {module.title}
                        </h3>


                        <p className="mt-2 text-sm text-foreground-muted">
                            {module.description}
                        </p>


                    </div>

                ))}

            </div>

        </div>

        </div>

    );

}
