"use client";

import { createModule } from "./actions";

export default function CreateModule({
                                         courseId,
                                     }: {
    courseId: string;
}) {

    return (

        <form
            action={createModule.bind(null, courseId)}
            className="space-y-3 mt-6"
        >

            <input
                name="title"
                placeholder="Module title"
                className="border p-2 block w-80"
            />

            <textarea
                name="description"
                placeholder="Description"
                className="border p-2 block w-80"
            />

            <input
                name="price"
                type="number"
                placeholder="Price"
                className="border p-2 block w-80"
            />

            <button
                className="bg-black text-white px-5 py-2 rounded"
            >
                Add Module
            </button>

        </form>

    );

}