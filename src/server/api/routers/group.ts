import { z } from "zod";
import { getSignedURL } from "@/actions/s3Actions"; // Import the S3 utility

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const groupRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const groups = await ctx.db.group.findMany({
      take: 50,
    });

    if (!groups) throw new Error("Failed to get groups");

    return groups;
  }),

  getAllByUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth?.userId;

    if (!userId) throw new Error("Not authenticated");

    const userExists = await ctx.db.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) throw new Error("User not found");

    const groupMembers = await ctx.db.groupMember.findMany({
      take: 50,
      where: {
        userId: userId,
      },
      include: {
        group: true,
      },
    });

    const groups = groupMembers.map((member) => member.group);

    const groupsWithMembersInfo = await Promise.all(
      groups.map(async (group) => {
        const members = await ctx.db.groupMember.findMany({
          where: { groupId: group.id },
          include: {
            user: {
              select: {
                firstName: true,
                imageUrl: true,
              },
            },
          },
        });

        // Transform members to JSON-compatible format
        const transformedMembers = members.map((member) => ({
          id: member.userId,
          firstName: member.user.firstName,
          imageUrl: member.user.imageUrl,
        }));

        return {
          ...group,
          members: transformedMembers, // Ensure members are JSON-compatible
        };
      }),
    );

    return groupsWithMembersInfo;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        members: z.array(z.string()).min(1),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const createdById = ctx.auth?.userId;

      if (!createdById) throw new Error("Not authenticated");

      const userExists = await ctx.db.user.findUnique({
        where: { id: createdById },
      });

      if (!userExists) throw new Error("User not found");

      const group = await ctx.db.group.create({
        data: {
          name: input.name,
          description: input.description || "",
          members: input.members,
          createdById: createdById,
        },
      });

      const groupMembers = await ctx.db.groupMember.createMany({
        data: input.members.map((memberId) => ({
          groupId: group.id,
          userId: memberId,
        })),
      });

      return { group, groupMembers };
    }),

  getByGroupId: protectedProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: {
          id: input.id,
        },
      });

      return group;
    }),

  createMessage: protectedProcedure
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
      // if (input.fileName && input.contentType) {
      //   const signedURLResult = await getSignedURL(
      //     input.fileName,
      //     input.contentType,
      //     "group-media",
      //   );
      //   if (signedURLResult.failure) {
      //     throw new Error(signedURLResult.failure);
      //   }
      //   mediaUrl = signedURLResult.success?.url.split("?")[0]; // Extract the base URL
      // }

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
