import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or password");
                }

                const doctor = await prisma.doctor.findUnique({
                    where: { email: credentials.email }
                });

                if (!doctor) {
                    throw new Error("Invalid email or password");
                }

                const isValid = await bcrypt.compare(credentials.password, doctor.password);

                if (!isValid) {
                    throw new Error("Invalid email or password");
                }

                return {
                    id: doctor.id,
                    email: doctor.email,
                    name: `${doctor.firstName} ${doctor.lastName}`,
                    clinicName: doctor.clinicName,
                    mapleimeReferenceId: doctor.mapleimeReferenceId,
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.clinicName = (user as any).clinicName;
                token.mapleimeReferenceId = (user as any).mapleimeReferenceId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).clinicName = token.clinicName as string;
                (session.user as any).mapleimeReferenceId = token.mapleimeReferenceId as string;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_default_secret_for_development",
};
