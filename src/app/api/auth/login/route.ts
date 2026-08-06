import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export async function POST(req: Request) {

    try {

        const body = await req.json();

        const { email, password } = body;


        if (!email || !password) {
            return NextResponse.json(
                {
                    error: "Email and password are required",
                },
                {
                    status: 400,
                }
            );
        }


        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });


        if (!user) {
            return NextResponse.json(
                {
                    error: "Invalid credentials",
                },
                {
                    status: 401,
                }
            );
        }


        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatch) {
            return NextResponse.json(
                {
                    error: "Invalid credentials",
                },
                {
                    status: 401,
                }
            );
        }


        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "7d",
            }
        );


        const response = NextResponse.json({

            message: "Login successful",

            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },

        });


        response.cookies.set(
            "token",
            token,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
            }
        );


        return response;


    } catch (error) {

        return NextResponse.json(
            {
                error: "Something went wrong",
            },
            {
                status: 500,
            }
        );

    }

}