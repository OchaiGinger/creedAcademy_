import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { env } from "@/lib/env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  // credentials: {
  //   async authorize(credentials: Record<string, unknown>) {
  //     const { email, registrationNumber } = credentials as {
  //       email: string;
  //       registrationNumber: string;
  //     };

  //     if (!email || !registrationNumber) return null;

  //     const student = await .findUnique({
  //       where: { registrationNumber },
  //       include: {
  //         appUser: {
  //           include: {
  //             authUser: true,
  //           },
  //         },
  //       },
  //     });

  //     if (!student) return null;
  //     if (student.appUser.authUser.email !== email) return null;

  //     return {
  //       id: student.appUser.authUser.id,
  //       email: student.appUser.authUser.email,
  //       name: `${student.firstName} ${student.lastName}`,
  //     };
  //   }
  // }
});
