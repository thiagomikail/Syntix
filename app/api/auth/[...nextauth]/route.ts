import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
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
                if (credentials?.username) {
                    return { id: "1", name: credentials.username, email: `${credentials.username}@syntix.local` };
                }
                return null;
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }: any) {
            if (session?.user) {
                session.user.id = token.sub;
            }
            return session;
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
