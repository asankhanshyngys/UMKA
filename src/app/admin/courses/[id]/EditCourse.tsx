"use client";

import { updateCourse } from "./actions";
import Link from "next/link";
import { Course } from "@/generated/prisma/client";


export default function EditCourse({
                                       course,
                                   }: {
    course: Course
}){

    return (

        <form
            action={updateCourse.bind(null, course.id)}
            className="space-y-3 mt-5"
        >

            <input
                name="title"
                defaultValue={course.title}
                className="border p-2 block"
            />


            <textarea
                name="description"
                defaultValue={course.description}
                className="border p-2 block"
            />


            <input
                name="price"
                type="number"
                defaultValue={course.price}
                className="border p-2 block"
            />


            <select
                name="difficulty"
                defaultValue={course.difficulty}
                className="border p-2"
            >

                <option value="BEGINNER">
                    Beginner
                </option>

                <option value="INTERMEDIATE">
                    Intermediate
                </option>

                <option value="ADVANCED">
                    Advanced
                </option>

            </select>


            <select
                name="status"
                defaultValue={course.status}
                className="border p-2"
            >

                <option value="DRAFT">
                    Draft
                </option>


                <option value="PUBLISHED">
                    Published
                </option>

            </select>



            <button
                className="bg-black text-white px-5 py-2 rounded"
            >
                Save changes
            </button>

            <Link
                href={`/admin/courses/${course.id}/content`}
                className="inline-block bg-blue-600 text-white px-5 py-2 rounded"
            >
                Manage Content
            </Link>


        </form>

    );

}
