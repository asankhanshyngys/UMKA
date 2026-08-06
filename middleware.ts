import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";


const protectedRoutes = [
    "/dashboard",
    "/courses",
    "/profile",
    "/admin",
];


const secret = new TextEncoder().encode(
    process.env.JWT_SECRET
);


export async function middleware(
    request: NextRequest
) {

    const token = request.cookies.get("token")?.value;


    if (!token) {

        return NextResponse.redirect(
            new URL("/login", request.url)
        );

    }


    try {

        await jwtVerify(
            token,
            secret
        );


        return NextResponse.next();


    } catch {


        return NextResponse.redirect(
            new URL("/login", request.url)
        );

    }

}



export const config = {
    matcher: [
        "/dashboard/:path*",
        "/courses/:path*",
        "/profile/:path*",
        "/admin/:path*",
    ],
};