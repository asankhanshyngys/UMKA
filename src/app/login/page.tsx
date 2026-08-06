"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function LoginPage() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin() {

        const res = await fetch("/api/auth/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });


        const data = await res.json();

        if (res.ok) {
            if (data.user.role === "ADMIN") {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        } else {
            alert("Login failed");
        }

    }


    return (
        <div className="flex min-h-screen items-center justify-center">

            <div className="w-96 space-y-4">

                <h1 className="text-2xl font-bold">
                    Login
                </h1>


                <input
                    className="border p-2 w-full"
                    placeholder="Email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                />


                <input
                    className="border p-2 w-full"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />


                <button
                    onClick={handleLogin}
                    className="bg-black text-white px-4 py-2 w-full"
                >
                    Login
                </button>

            </div>

        </div>
    );
}