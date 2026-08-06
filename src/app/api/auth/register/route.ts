import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { createToken } from "@/lib/auth";


export async function POST(request: Request) {

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


        const existingUser = await prisma.user.findUnique({

            where:{
                email
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

                email,

                name,

                password: hashedPassword,

            }

        });



        const token = createToken(user.id);



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
                secure:false,
                sameSite:"lax",
                maxAge:60*60*24*7
            }
        );


        return response;



    } catch(error){

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