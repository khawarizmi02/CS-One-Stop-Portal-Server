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
        _count: {
          select: {
            Comments: true,
          },
        },
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
        content: z.array(z.any()),
        parentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.auth?.userId;

      if (!authorId) {
        throw new Error("Not authenticated");
      }

      // Validate parentId if provided
      if (input.parentId) {
        const parentComment = await ctx.db.forumComment.findUnique({
          where: { id: input.parentId },
        });

        if (!parentComment) {
          throw new Error("Parent comment not found");
        }
      }

      const comment = await ctx.db.forumComment.create({
        data: {
          content: input.content,
          createdById: authorId,
          forumId: input.forumId,
          parentId: input.parentId,
        },
      });

      return comment;
    }),

  voteForumComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
        direction: z.enum(["up", "down"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;

      if (!userId) {
        throw new Error("Not authenticated");
      }

      // Here you would implement the actual vote saving logic
      // This is a simplified example - you'd need to add a CommentVote model
      // to your schema to properly track votes

      return {
        success: true,
        commentId: input.commentId,
        direction: input.direction,
      };
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
              replies: {
                include: {
                  createdBy: true,
                },
              },
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
