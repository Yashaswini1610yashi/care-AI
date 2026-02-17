import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { age, medicalHistory, doctorName, doctorPhone, doctorEmail } = await req.json();

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                age: age ? parseInt(age) : null,
                medicalHistory: medicalHistory || null,
                doctorName: doctorName || null,
                doctorPhone: doctorPhone || null,
                doctorEmail: doctorEmail || null,
            },
        });

        return NextResponse.json({ message: "Profile updated successfully", user });
    } catch (error: any) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                age: true,
                medicalHistory: true,
                doctorName: true,
                doctorPhone: true,
                doctorEmail: true,
            }
        });

        return NextResponse.json({ user });
    } catch (error: any) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}
