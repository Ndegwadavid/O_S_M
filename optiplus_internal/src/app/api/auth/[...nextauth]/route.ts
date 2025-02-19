import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db"; // Use the standardized query function

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const users = await query(
            "SELECT * FROM users WHERE username = ?",
            [credentials.username]
          ) as Array<{
            id: number;
            username: string;
            password: string;
            role: "staff" | "admin";
          }>;

          if (users.length === 0) return null;

          const user = users[0];

          // For now, compare plain text passwords (since we inserted them as plain text)
          if (user.password === credentials.password) {
            return {
              id: user.id.toString(), // Convert to string for JWT
              name: user.username,    // Use username as name
              role: user.role,       // Include role
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/staff-login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };