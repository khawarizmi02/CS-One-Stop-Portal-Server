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
        description: z.array(z.any()),
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.auth?.userId;

      if (!authorId) {
        throw new Error("Not authenticated");
      }

      // Log the authorId to verify it
      console.log("authorId: ", authorId);

      // Check if the authorId exists in the User table
      const userExists = await ctx.db.user.findUnique({
        where: { id: authorId },
      });

      if (!userExists) {
        throw new Error("User not found");
      }

      const post = await ctx.db.forum.create({
        data: {
          title: input.title,
          description: input.description,
          imageUrl: input.imageUrl,
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
            orderBy: {
              createdAt: "desc",
            },
          },
          createdBy: true,
        },
      });

      if (!forum) return null;

      // Convert flat comments into a nested structure
      const commentMap = new Map<string, any>();

      // Initialize map with comments
      forum.Comments.forEach((comment) => {
        comment.replies = [];
        commentMap.set(comment.id, comment);
      });

      // Build the nested structure
      const nestedComments: any[] = [];

      forum.Comments.forEach((comment) => {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.replies.push(comment);
          }
        } else {
          nestedComments.push(comment);
        }
      });

      return {
        ...forum,
        Comments: nestedComments,
      };
    }),
});
