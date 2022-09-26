import NextAuth, { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { IExtSession } from "../../../components/types"

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions ={
    secret: process.env.SECRET,
    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProvider({
          clientId: process.env.GITHUB_ID ?? "",
          clientSecret: process.env.GITHUB_SECRET ?? "",
          // @ts-ignore
          scope: "read:user",
        }),
        EmailProvider({
          server: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          },
          from: process.env.SMTP_FROM,
        }),
      ],
      callbacks: {
        async session({session, token, user}) {
          const localSession:IExtSession =  {
              ...session,
              user: {
                  id: user.id,
                  ...session.user
              }
          }
          session = localSession
          return localSession
        }
      }
  }

  export default NextAuth(authOptions)

