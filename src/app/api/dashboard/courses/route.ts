import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";


export async function GET() {

    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;


    if (!token) {
        return NextResponse.json(
            {error:"Unauthorized"},
            {status:401}
        );
    }


    const payload = verifyToken(token);


    if (!payload) {
        return NextResponse.json(
            {error:"Invalid token"},
            {status:401}
        );
    }



    const purchases = await prisma.coursePurchase.findMany({

        where:{
            userId: payload.userId,
            status:"COMPLETED"
        },


        include:{

            course:{

                include:{

                    instructor:true,

                    category:true,

                    modules:{
                        orderBy:{
                            order:"asc"
                        },

                        include:{
                            videos:true
                        }
                    }

                }

            }

        }

    });



    return NextResponse.json({

        courses:purchases.map(item=>item.course)

    });

}