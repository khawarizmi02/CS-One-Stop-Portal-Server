import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
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
