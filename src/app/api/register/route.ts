import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        const { username, email, password, phoneNumber, age, medicalHistory } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email: email || undefined }],
            },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                phoneNumber,
                password: hashedPassword,
                age: age ? parseInt(age) : null,
                medicalHistory: medicalHistory ? JSON.stringify(medicalHistory) : null,
            },
        });

        return NextResponse.json({ message: "User registered successfully", userId: user.id });
    } catch (error: any) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Registration failed", details: error.message }, { status: 500 });
    }
}
