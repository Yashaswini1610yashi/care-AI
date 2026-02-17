import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // For security, don't reveal that the user doesn't exist
            return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
        }

        const resetToken = crypto.randomUUID();
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

        await sendEmail(
            email,
            "Reset Your CareScan AI Password",
            `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>We received a request to reset the password for your CareScan AI account.</p>
                <p>Click the link below to set a new password:</p>
                <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
                <p style="margin-top: 20px; color: #666;">This link is valid for 24 hours. If you didn't request this, you can safely ignore this email.</p>
            </div>
            `
        );

        return NextResponse.json({ message: "If an account exists, a reset link has been sent." });

    } catch (error: any) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
