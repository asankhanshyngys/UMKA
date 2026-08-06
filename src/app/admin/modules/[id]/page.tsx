import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createVideo, deleteVideo, updateModule, updateVideo } from "./actions";

export default async function ModulePage({
                                             params,
                                         }: {
    params: Promise<{ id: string }>;
}) {

    const { id } = await params;

    const courseModule = await prisma.module.findUnique({

        where: {
            id,
        },

        include: {
            videos: { where: { deletedAt: null }, orderBy: { order: "asc" } },
        },

    });

    if (!courseModule) {
        notFound();
    }

    return (

        <div className="p-10">

            <h1 className="text-3xl font-bold">
                {courseModule.title}
            </h1>

            <p className="mt-3">
                {courseModule.description}
            </p>

            <p className="mt-2">
                Price: {courseModule.price} ₸
            </p>

            <form action={updateModule.bind(null, courseModule.id, courseModule.courseId)} className="mt-6 grid max-w-xl gap-3">
                <h2 className="text-xl font-semibold">Edit module</h2>
                <input name="title" defaultValue={courseModule.title} className="border p-2" />
                <textarea name="description" defaultValue={courseModule.description ?? ""} className="border p-2" />
                <input name="price" type="number" min="0" defaultValue={courseModule.price} className="border p-2" />
                <button className="w-fit rounded bg-black px-4 py-2 text-white">Save module</button>
            </form>

            <div className="mt-10">

                <h2 className="text-2xl font-semibold">
                    Videos
                </h2>

                <form action={createVideo.bind(null, courseModule.id, courseModule.courseId)} className="mt-5 grid max-w-xl gap-3 rounded border p-4">
                    <h3 className="font-semibold">Add video</h3>
                    <input name="title" placeholder="Video title" required className="border p-2" />
                    <textarea name="description" placeholder="Description" className="border p-2" />
                    <input name="storageKey" placeholder="Storage key or video path" required className="border p-2" />
                    <input name="duration" type="number" min="0" placeholder="Duration in seconds" required className="border p-2" />
                    <input name="price" type="number" min="0" placeholder="Price" required className="border p-2" />
                    <label className="flex items-center gap-2"><input name="isFreePreview" type="checkbox" /> Free preview</label>
                    <button className="w-fit rounded bg-black px-4 py-2 text-white">Add video</button>
                </form>

                {courseModule.videos.length === 0 ? (

                    <p className="mt-4 text-gray-500">
                        No videos yet.
                    </p>

                ) : (

                    courseModule.videos.map(video => (

                        <form
                            key={video.id}
                            action={updateVideo.bind(null, video.id, courseModule.id, courseModule.courseId)}
                            className="mt-3 grid max-w-xl gap-3 rounded border p-4"
                        >
                            <input name="title" defaultValue={video.title} required className="border p-2" />
                            <textarea name="description" defaultValue={video.description ?? ""} className="border p-2" />
                            <input name="storageKey" defaultValue={video.storageKey} required className="border p-2" />
                            <input name="duration" type="number" min="0" defaultValue={video.duration} required className="border p-2" />
                            <input name="price" type="number" min="0" defaultValue={video.price} required className="border p-2" />
                            <label className="flex items-center gap-2"><input name="isFreePreview" type="checkbox" defaultChecked={video.isFreePreview} /> Free preview</label>
                            <div className="flex gap-3"><button className="rounded bg-black px-4 py-2 text-white">Save video</button><button formAction={deleteVideo.bind(null, video.id, courseModule.id, courseModule.courseId)} className="rounded border border-red-600 px-4 py-2 text-red-600">Delete</button></div>
                        </form>

                    ))

                )}

            </div>

        </div>

    );

}
