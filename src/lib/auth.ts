import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;


interface TokenPayload {
    userId: string;
}


export function createToken(userId:string){

    return jwt.sign(
        {
            userId,
        },
        JWT_SECRET,
        {
            expiresIn:"7d",
        }
    );

}



export function verifyToken(token:string): TokenPayload | null {

    try {

        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );


        if (typeof decoded === "string") {
            return null;
        }


        return decoded as TokenPayload;


    } catch {

        return null;

    }
}

export async function getCurrentUser() {

    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
        return null;
    }

    return verifyToken(token);

}