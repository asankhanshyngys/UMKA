"use client";

import { updateCourse } from "./actions";
import Link from "next/link";
import { Course } from "@/generated/prisma/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";


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

            <ImageUploadField name="thumbnail" defaultValue={course.thumbnail} label="Course thumbnail" />


            <input
                name="price"
                type="number"
                defaultValue={course.price}
                className="border p-2 block"
            />

            <input
                name="oldPrice"
                type="number"
                min="0"
                defaultValue={course.oldPrice ?? ""}
                placeholder="Старая цена (для скидки, необязательно)"
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
                className="min-h-11 bg-black px-5 py-3 text-white rounded"
            >
                Save changes
            </button>

            <Link
                href={`/admin/courses/${course.id}/content`}
                className="inline-flex min-h-11 items-center bg-blue-600 px-5 py-3 text-white rounded"
            >
                Manage Content
            </Link>


        </form>

    );

}
