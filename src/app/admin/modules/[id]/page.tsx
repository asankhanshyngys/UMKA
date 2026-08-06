import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

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
            videos: true,
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

            <div className="mt-10">

                <h2 className="text-2xl font-semibold">
                    Videos
                </h2>

                {courseModule.videos.length === 0 ? (

                    <p className="mt-4 text-gray-500">
                        No videos yet.
                    </p>

                ) : (

                    courseModule.videos.map(video => (

                        <div
                            key={video.id}
                            className="mt-3 rounded border p-4"
                        >

                            <h3 className="font-bold">
                                {video.title}
                            </h3>

                        </div>

                    ))

                )}

            </div>

        </div>

    );

}