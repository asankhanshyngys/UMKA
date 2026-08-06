import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
        redirect("/login");
    }

    const payload = verifyToken(token);

    if (!payload) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: payload.userId,
        },
    });

    if (!user) {
        redirect("/login");
    }

    if (user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold">
                Admin Panel
            </h1>

            <p className="mt-4">
                Welcome, {user.name}
            </p>
        </div>
    );
}