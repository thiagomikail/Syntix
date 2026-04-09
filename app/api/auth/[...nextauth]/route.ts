import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Demo Access",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "johndoe" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim();
        if (!username) return null;

        const RESERVED = ["admin", "root", "support", "travelvault", "moderator", "staff"];
        const valid = /^[\w\s\-\u00C0-\u024F]{2,30}$/u.test(username);
        if (!valid || RESERVED.includes(username.toLowerCase())) return null;

        try {
          const sanitized = username.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
          const email = `${sanitized}@vault.local`;
          const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: { name: username, email },
          });
          return { id: user.id, name: user.name, email: user.email };
        } catch (error) {
          console.error("[Auth] Credentials error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session?.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role || "USER";
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        token.role = (user as User & { role?: string }).role;
      }
      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
          } else {
            return {};
          }
        } catch {
          // Token will expire naturally if DB is unreachable
        }
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
