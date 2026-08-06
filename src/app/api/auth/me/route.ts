import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function GET() {

    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;


    if (!token) {

        return NextResponse.json(
            {
                error:"Unauthorized"
            },
            {
                status:401
            }
        );

    }


    const payload = verifyToken(token) as {
        userId: string;
    };


    if (!payload) {

        return NextResponse.json(
            {
                error:"Invalid token"
            },
            {
                status:401
            }
        );

    }


    const user = await prisma.user.findUnique({

        where:{
            id: payload.userId
        },

        select:{
            id:true,
            email:true,
            name:true,
            role:true
        }

    });



    return NextResponse.json({
        user
    });

}