"use client";


import { createCourse } from "./actions";
import { Instructor, Category } from "@/generated/prisma/client";


export default function CreateCourse({

                                         instructors,
                                         categories,

                                     }: {

    instructors: Instructor[];
    categories: Category[];

}) {


    return (

        <form
            action={createCourse}
            className="space-y-3 mt-5"
        >

            <input
                name="title"
                placeholder="Course title"
                className="border p-2 block"
            />

            <textarea
                name="description"
                placeholder="Course description"
                className="border p-2 block w-full"
            />

            <input
                name="price"
                placeholder="Price"
                type="number"
                className="border p-2 block"
            />



            <select
                name="instructorId"
                className="border p-2"
            >

                {instructors.map((i) => (

                    <option
                        key={i.id}
                        value={i.id}
                    >
                        {i.name}
                    </option>

                ))}

            </select>


            <select
                name="categoryId"
                className="border p-2"
            >

                {categories.map((c) => (

                    <option
                        key={c.id}
                        value={c.id}
                    >
                        {c.name}
                    </option>

                ))}

            </select>

            <select
                name="difficulty"
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
                Create
            </button>


        </form>

    );

}