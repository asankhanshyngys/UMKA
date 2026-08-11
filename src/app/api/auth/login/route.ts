import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { checkLoginRateLimit, clearLoginRateLimit, getClientIp, recordFailedLogin } from "@/lib/rate-limit";

const DUMMY_PASSWORD_HASH = "$2b$10$wDBktPVZASrj0vGJQqKlruD5DWEQjkQx6Fsg4m3RsfRtxk2W28Qzy";


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


        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        const rateLimitKey = `${getClientIp(req)}:${normalizedEmail}`;
        const rateLimit = checkLoginRateLimit(rateLimitKey);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: "Too many sign-in attempts. Please try again later." },
                { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        const passwordMatch = await bcrypt.compare(password, user?.password ?? DUMMY_PASSWORD_HASH);

        if (!user || !passwordMatch) {
            recordFailedLogin(rateLimitKey);
            return NextResponse.json(
                {
                    error: "Invalid credentials",
                },
                {
                    status: 401,
                }
            );
        }


        clearLoginRateLimit(rateLimitKey);


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


    } catch {

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
