import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username?: string | null
      role?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    username?: string | null
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    username?: string | null
    role?: string
  }
}