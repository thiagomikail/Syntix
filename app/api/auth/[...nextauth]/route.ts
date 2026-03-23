import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Founder Access",
            credentials: {
                username: { label: "Callsign", type: "text", placeholder: "Maverick" }
            },
            async authorize(credentials) {
                const username = credentials?.username?.trim();
                if (!username) return null;

                try {
                    // Enforce valid callsign format and block reserved names
                    const RESERVED = ["admin", "root", "support", "syntix", "moderator", "staff"];
                    const validCallsign = /^[\w\s\-\u00C0-\u024F]{2,30}$/u.test(username);
                    if (!validCallsign || RESERVED.includes(username.toLowerCase())) return null;

                    // Sanitize username for email derivation (replace non-alphanumeric with underscore)
                    const sanitized = username.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
                    const email = `${sanitized}@syntix.local`;
                    const user = await prisma.user.upsert({
                        where: { email },
                        update: {},
                        create: { name: username, email }
                    });
                    return { id: user.id, name: user.name, email: user.email };
                } catch (error) {
                    console.error("AUTH_ERROR_DETAIL:", error);
                    return null;
                }
            }
        })
    ],

    callbacks: {
        async session({ session, token }: any) {
            if (session?.user) {
                session.user.id = token.sub;
                session.user.role = token.role || "USER";
            }
            return session;
        },
        async jwt({ token, user, trigger, session }: any) {
            if (user) {
                token.role = user.role;
            }
            // If the role was manually updated in the DB, we need to refresh the token. 
            // The cleanest way is to fetch the role from the DB here during JWT creation/refresh.
            if (token.sub) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.sub },
                        select: { role: true },
                    });
                    if (dbUser) {
                        token.role = dbUser.role;
                    } else {
                        // Invalidate token if user no longer exists
                        return {};
                    }
                } catch {
                    // Silently ignore — user may have been deleted; token will expire naturally
                }
            }
            return token;
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
