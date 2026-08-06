import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Courses from "./Courses";

export default async function DashboardPage() {


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

        where:{
            id: payload.userId
        },

        select:{
            name:true,
            email:true,
            role:true
        }

    });



    if (!user) {
        redirect("/login");
    }



    return (
        <div className="p-10">

            <h1 className="text-3xl font-bold">
                Dashboard
            </h1>


            <div className="mt-5">

                <p>
                    Name: {user.name}
                </p>

                <p>
                    Email: {user.email}
                </p>

                <p>
                    Role: {user.role}
                </p>

            </div>

        </div>
    );
}