import { prisma } from "@/lib/prisma";
import CreateCourse from "./CreateCourse";
import Link from "next/link";
import { deleteCourse } from "./actions";

export default async function CoursesPage() {


    const courses = await prisma.course.findMany({

        where:{
            deletedAt:null,
        },

        include:{
            instructor:true,
            category:true,
            modules:true,
        },

        orderBy:{
            createdAt:"desc",
        },

    });


    const instructors = await prisma.instructor.findMany();


    const categories = await prisma.category.findMany();



    return (

        <div className="p-10">


            <h1 className="text-3xl font-bold">
                Courses
            </h1>


            <CreateCourse
                instructors={instructors}
                categories={categories}
            />


            <div className="mt-10 space-y-4">


                {courses.map(course=>(
                    <div
                        key={course.id}
                        className="border p-5 rounded"
                    >

                        <h2 className="font-bold text-xl">
                            {course.title}
                        </h2>


                        <p>
                            Instructor: {course.instructor.name}
                        </p>


                        <div className="mt-3">

                            <h3 className="font-semibold">
                                Modules:
                            </h3>


                            {course.modules.map(module => (

                                <p key={module.id}>
                                    - {module.title}
                                </p>

                            ))}

                        </div>


                        <p>
                            Price: {course.price} ₸
                        </p>


                        <p>
                            Level: {course.difficulty}
                        </p>


                        <p>
                            Status: {course.status}
                        </p>


                        <Link
                            href={`/admin/courses/${course.id}`}
                            className="inline-block mt-3 text-blue-600"
                        >
                            Edit
                        </Link>


                        <Link
                            href={`/admin/courses/${course.id}/content`}
                            className="text-green-600"
                        >
                            Content
                        </Link>


                        <form action={deleteCourse.bind(null, course.id)}>

                            <button
                                className="text-red-600 mt-3"
                            >
                                Delete
                            </button>

                        </form>

                    </div>
                ))}


            </div>


        </div>

    );
}