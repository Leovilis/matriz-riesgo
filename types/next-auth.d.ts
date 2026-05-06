// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      area: string;
      mustChangePassword: boolean;
    } & DefaultSession["user"];
  }
  
  interface User extends DefaultUser {
    role: string;
    area: string;
    mustChangePassword: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string;
    area: string;
    mustChangePassword: boolean;
  }
}