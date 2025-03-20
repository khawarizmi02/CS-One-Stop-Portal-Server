import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const announcementRouter = createTRPCRouter({
  getALl: protectedProcedure.query(async ({ ctx }) => {
    const announcement = await ctx.db.announcement.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: true,
      },
    });

    if (!announcement) throw new Error("Failed to get announcements");

    return announcement;
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.array(z.any()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.auth?.userId;

      if (!authorId) {
        throw new Error("Not authenticated");
      }

      const userExists = await ctx.db.user.findUnique({
        where: { id: authorId },
      });

      if (!userExists) {
        throw new Error("User not found");
      }

      const post = await ctx.db.announcement.create({
        data: {
          title: input.title,
          content: input.content,
          createdById: authorId,
        },
      });

      return post;
    }),
});
