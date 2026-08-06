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

        <div className="p-10">

            <h1 className="text-3xl font-bold">
                Edit Course
            </h1>


            <EditCourse
                course={course}
            />
            <div className="mt-10">

            <h2 className="text-2xl font-bold">
                Modules
            </h2>


            <div className="mt-5 space-y-3">

                {course.modules.map(module=>(

                    <div
                        key={module.id}
                        className="border p-4 rounded"
                    >

                        <h3 className="font-bold">
                            {module.title}
                        </h3>


                        <p>
                            {module.description}
                        </p>


                    </div>

                ))}

            </div>

        </div>

        </div>

    );

}