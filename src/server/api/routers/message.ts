import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const messageRouter = createTRPCRouter({
  getMessages: protectedProcedure
    .input(z.object({ groupId: z.string().nonempty() }))
    .query(async ({ ctx, input }) => {
      const messages = await ctx.db.groupMessage.findMany({
        take: 50,
        where: { groupId: input.groupId },
        include: { createdBy: true },
      });
      return messages;
    }),

  sendMessage: protectedProcedure
    .input(z.object({ groupId: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;

      if (!userId) throw new Error("User not authenticated");

      const message = await ctx.db.groupMessage.create({
        data: {
          content: input.content,
          groupId: input.groupId,
          createdById: userId,
        },
        include: { createdBy: true },
      });

      return message;
    }),
});
