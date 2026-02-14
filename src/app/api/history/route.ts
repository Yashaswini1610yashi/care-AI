import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const prescriptions = await prisma.prescription.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });

        const parsedHistory = prescriptions.map((p) => ({
            id: p.id,
            createdAt: p.createdAt,
            ...JSON.parse(p.data),
        }));

        return NextResponse.json({ history: parsedHistory });
    } catch (error: any) {
        console.error("History API Error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
