import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { env } from "@/lib/env";
import { multiSession } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "USER" },
      firstName: { type: "string" },
      middleName: { type: "string", required: false },
      lastName: { type: "string" },
      gender: { type: "string" },
      dateOfBirth: { type: "string" },
      phone: { type: "string" },
      nationality: { type: "string" },
      stateOfOrigin: { type: "string" },
      lga: { type: "string" },
      address: { type: "string" },
      ninNumber: { type: "string" },
      category: { type: "string" },
      trainingMode: { type: "string" },
    },
  },

  emailAndPassword: {
    enabled: true,
    async authorize(credentials: Record<string, string>) {
      const { email, password, registrationNumber } = credentials;

      // 1. Fetch the user including their student profile and credentials
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          student: true,
          accounts: { where: { providerId: "credentials" } },
        },
      });

      // 2. Validate user exists and has a password
      if (!user || !user.accounts[0]?.password) {
        throw new Error("Invalid email or password");
      }

      // 3. Password Check (Assuming plain text or your chosen hashing)
      const isPasswordCorrect = user.accounts[0].password === password;
      if (!isPasswordCorrect) {
        throw new Error("Invalid email or password");
      }

      // 4. ADMIN VERIFICATION
      if (user.role === "ADMIN") {
        return {
          id: user.id,
          email: user.email,
          role: "ADMIN",
          name: user.name,
        };
      }

      // 5. INSTRUCTOR VERIFICATION
      if (user.role === "INSTRUCTOR") {
        return {
          id: user.id,
          email: user.email,
          role: "INSTRUCTOR",
          name: user.name,
        };
      }

      // 6. STUDENT (USER) VERIFICATION
      if (user.role === "USER") {
        if (!user.student) {
          throw new Error("Student profile not found. Please contact support.");
        }

        // Only enforce registrationNumber check for students
        if (user.student.registrationNumber !== registrationNumber) {
          throw new Error("Invalid Registration Number for this account.");
        }

        return {
          id: user.id,
          email: user.email,
          role: "USER",
          name: user.name,
        };
      }

      return null;
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const data = user as any;

          // A. Logic for Instructor Invites
          const pendingInvite = await prisma.instructor.findUnique({
            where: { email: user.email },
          });

          if (pendingInvite && !pendingInvite.userId) {
            await prisma.instructor.update({
              where: { id: pendingInvite.id },
              data: { userId: user.id },
            });
            await prisma.user.update({
              where: { id: user.id },
              data: { role: "INSTRUCTOR" },
            });
            return;
          }

          // B. Logic for Seeding Student Profile
          try {
            const birthDate = data.dateOfBirth
              ? new Date(data.dateOfBirth)
              : new Date();

            await prisma.student.create({
              data: {
                userId: user.id,
                firstName: data.firstName || "N/A",
                lastName: data.lastName || "N/A",
                middleName: data.middleName || null,
                gender: data.gender as any,
                dateOfBirth: birthDate,
                phone: data.phone || "N/A",
                nationality: data.nationality || "Nigerian",
                stateOfOrigin: data.stateOfOrigin || "N/A",
                lga: data.lga || "N/A",
                address: data.address || "N/A",
                ninNumber: data.ninNumber || `PENDING-${Date.now()}`,
                category: (data.category as any) || "REGULAR",
                trainingMode: (data.trainingMode as any) || "PHYSICAL",
                passportPhotoPath: "/placeholder-avatar.png",
                status: "PENDING",
              },
            });
          } catch (error) {
            console.error(
              "CRITICAL: Student Creation Failed during Signup Hook:",
              error,
            );
          }
        },
      },
    },
  },

  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    },
  },

  // Ensure these match your actual route paths
  pages: {
    signIn: "/signin",
    signUp: "/signup",
    error: "/auth-error",
  },
  plugins: [
    multiSession(), // 2. Add this
  ],
});
