// lib/authOptions.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { verifyCredentials, recordUserSession } from "@/lib/users";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }
        
        const user = await verifyCredentials(credentials.email, credentials.password);
        
        if (!user) {
          throw new Error("Email o contraseña incorrectos");
        }
        
        // Registrar el acceso
        await recordUserSession(credentials.email);
        
        return {
          id: user.id,
          name: user.area,
          email: user.email,
          role: user.role,
          area: user.area,
          mustChangePassword: user.mustChangePassword,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.role = user.role;
        token.area = user.area;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.area = token.area as string;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};