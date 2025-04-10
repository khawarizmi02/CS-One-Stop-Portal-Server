import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { updateUserRoleMetadata } from "@/lib/clerk";
import { update } from "@orama/orama";

export const userRouter = createTRPCRouter({
  getUserId: publicProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.auth?.userId;

      if (!userId) {
        console.error(
          "Authentication error: ctx.auth is undefined or userId is missing",
          ctx.auth,
        );
        throw new Error("Not authenticated");
      }

      return userId;
    } catch (error) {
      console.error("Error in getUserId procedure:", error);
      throw error;
    }
  }),

  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        role: z.enum(["admin", "student", "lecturer"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, role } = input;
      if (ctx.auth?.userId) {
        console.error("User ID is missing in context");
        throw new Error("Not authenticated");
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: userId },
        data: {
          role,
        },
      });

      await updateUserRoleMetadata({ userId, role });

      return updatedUser;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      take: 50,
    });

    if (!users) throw new Error("Failed to get users");

    return users;
  }),

  getStudent: protectedProcedure.query(async ({ ctx }) => {
    const student = await ctx.db.user.findMany({
      take: 50,
      where: {
        role: "student",
      },
    });

    if (!student) throw new Error("Failed to get student");

    return student;
  }),
});
