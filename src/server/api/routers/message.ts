import { getSignedURL } from "@/actions/s3Actions";
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
    .input(
      z.object({
        groupId: z.string().nonempty(),
        content: z.string().optional(),
        messageType: z.enum(["text", "image", "file"]).default("text"),
        mediaUrl: z.string().optional(),
        fileName: z.string().optional(),
        contentType: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;

      if (!userId) throw new Error("Not authenticated");

      const groupExists = await ctx.db.group.findUnique({
        where: { id: input.groupId },
      });

      if (!groupExists) throw new Error("Group not found");

      let mediaUrl = input.mediaUrl;

      // If a file is being uploaded, generate a signed URL and save the file
      if (input.fileName && input.contentType) {
        const signedURLResult = await getSignedURL(
          input.fileName,
          input.contentType,
          "group-media",
        );
        if (signedURLResult.failure) {
          throw new Error(signedURLResult.failure);
        }
        mediaUrl = signedURLResult.success?.url.split("?")[0]; // Extract the base URL
      }

      // Save the message
      const message = await ctx.db.groupMessage.create({
        data: {
          content: input.content,
          messageType: input.messageType,
          mediaUrl,
          createdById: userId,
          groupId: input.groupId,
        },
      });

      // If the message contains media, save it in GroupMedia
      if (mediaUrl) {
        await ctx.db.groupMedia.create({
          data: {
            mediaType: input.messageType,
            mediaUrl,
            createdById: userId,
            groupId: input.groupId,
          },
        });
      }

      return message;
    }),
});
