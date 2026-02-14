import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

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
                    throw new Error("Invalid password");
                }

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
