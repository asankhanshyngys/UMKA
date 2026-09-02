import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { createToken } from "@/lib/auth";
import { createEmailVerificationToken } from "@/lib/account-tokens";
import { sendVerificationEmail } from "@/lib/auth-email";
import { checkEndpointRateLimit, getClientIp } from "@/lib/rate-limit";


export async function POST(request: Request) {

    const limit = checkEndpointRateLimit("register", getClientIp(request), 10, 60 * 60 * 1000);
    if (!limit.allowed) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });

    try {

        const body = await request.json();

        const {
            email,
            name,
            password
        } = body;


        if (!email || !name || !password) {

            return NextResponse.json(
                {
                    error: "All fields are required"
                },
                {
                    status:400
                }
            );

        }

        if (
            typeof email !== "string" ||
            typeof name !== "string" ||
            typeof password !== "string" ||
            password.length < 8
        ) {
            return NextResponse.json(
                { error: "Введите корректные данные. Пароль должен содержать минимум 8 символов." },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedName = name.trim();


        const existingUser = await prisma.user.findUnique({

            where:{
                email: normalizedEmail
            }

        });


        if(existingUser){

            return NextResponse.json(
                {
                    error:"User already exists"
                },
                {
                    status:400
                }
            );

        }


        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        const user = await prisma.user.create({

            data:{

                email: normalizedEmail,

                name: normalizedName,

                password: hashedPassword,

            }

        });

        try {
            const verificationToken = await createEmailVerificationToken(user.id);
            await sendVerificationEmail(user.email, verificationToken);
        } catch (emailError) {
            console.error("Unable to send verification email", emailError);
        }



        const token = createToken(user.id, user.sessionVersion);



        const response = NextResponse.json({

            message:"User created",

            user:{
                id:user.id,
                email:user.email,
                name:user.name
            }

        });



        response.cookies.set(
            "token",
            token,
            {
                httpOnly:true,
                secure: process.env.NODE_ENV === "production",
                sameSite:"lax",
                maxAge:60*60*24*7,
                path: "/"
            }
        );


        return response;



    } catch {

        return NextResponse.json(
            {
                error:"Registration failed"
            },
            {
                status:500
            }
        );

    }

}
