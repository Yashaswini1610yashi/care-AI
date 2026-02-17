import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendEmail } from "@/lib/email";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { username: credentials.username },
                            { email: credentials.username },
                            { phoneNumber: credentials.username }
                        ]
                    },
                });

                if (!user || !user.password) {
                    throw new Error("No user found");
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) {
                    // Increment failed attempts
                    const attempts = (user.failedLoginAttempts || 0) + 1;
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { failedLoginAttempts: attempts }
                    });

                    if (attempts >= 5) {
                        // Send recovery email on 5th attempt
                        if (attempts === 5 && user.email) {
                            const resetToken = crypto.randomUUID();
                            await prisma.user.update({
                                where: { id: user.id },
                                data: {
                                    resetToken,
                                    resetTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                                }
                            });

                            const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
                            await sendEmail(
                                user.email,
                                "Security Alert: Multiple Failed Login Attempts",
                                `
                                 <div style="font-family: sans-serif; padding: 20px;">
                                     <h2>Multiple Failed Login Attempts</h2>
                                     <p>We noticed 5 failed login attempts on your CareScan AI account.</p>
                                     <p>If this was you, or if you forgot your password, you can reset it instantly using the link below:</p>
                                     <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
                                     <p style="margin-top: 20px; color: #666;">If this wasn't you, your account may be at risk. We recommend resetting your password immediately.</p>
                                 </div>
                                 `
                            );
                        }
                        throw new Error("Too many failed attempts. A recovery email has been sent to your registered address.");
                    }

                    throw new Error("Invalid password");
                }

                // Reset failed attempts on success
                await prisma.user.update({
                    where: { id: user.id },
                    data: { failedLoginAttempts: 0 }
                });

                return {
                    id: user.id,
                    name: user.username,
                    email: user.email,
                };
            },
        }),
    ],
    callbacks: {
        async session({ session, token }: any) {
            if (token) {
                session.user.id = token.id;
                session.user.name = token.name;
            }
            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
            }
            return token;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt" as const,
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
