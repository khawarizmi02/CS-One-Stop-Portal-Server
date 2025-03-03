import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const forumRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const forums = await ctx.db.forum.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: true,
      },
    });

    return forums;
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.auth?.userId;

      if (!authorId) {
        throw new Error("Not authenticated");
      }

      const post = await ctx.db.forum.create({
        data: {
          ...input,
          createdById: authorId,
        },
      });

      return post;
    }),

  createForumComment: protectedProcedure
    .input(
      z.object({
        forumId: z.string(),
        commentText: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.auth?.userId;

      if (!authorId) {
        throw new Error("Not authenticated");
      }

      const comment = await ctx.db.forumComment.create({
        data: {
          content: input.commentText,
          createdById: authorId,
          forumId: input.forumId,
        },
      });

      return comment;
    }),

  getForumById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const forum = await ctx.db.forum.findUnique({
        where: {
          id: input.id,
        },
        include: {
          Comments: {
            include: {
              createdBy: true,
              replies: true,
            },
          },
          createdBy: true,
        },
      });

      return forum;
    }),
});
