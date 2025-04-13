import { z } from "zod";
import { deleteFileFromS3, getSignedURL } from "@/actions/s3Actions"; // Import the S3 utility

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

      // make sure the creator is in the members list
      if (!input.members.includes(createdById)) {
        input.members.push(createdById);
      }

      const group = await ctx.db.group.create({
        data: {
          name: input.name,
          description: input.description || "",
          members: input.members,
          createdById: createdById,
        },
      });

      let role = "MEMBER";
      // make the creator an admin

      if (input.members.includes(createdById)) {
        role = "ADMIN";
      }

      const groupMembers = await ctx.db.groupMember.createMany({
        data: input.members.map((memberId) => ({
          groupId: group.id,
          userId: memberId,
          role: role,
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

  // Add these new procedures to your group router in src/server/api/routers/group.ts

  // Inside your existing groupRouter:

  getGroupMembers: protectedProcedure
    .input(
      z.object({
        groupId: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;

      if (!userId) throw new Error("Not authenticated");

      const members = await ctx.db.groupMember.findMany({
        where: {
          groupId: input.groupId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
      });

      return members.map((member) => ({
        id: member.user.id,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        imageUrl: member.user.imageUrl,
        role: member.role,
      }));
    }),

  addMembers: protectedProcedure
    .input(
      z.object({
        groupId: z.string().nonempty(),
        memberIds: z.array(z.string().nonempty()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;

      if (!userId) throw new Error("Not authenticated");

      // Check if user has permission to add members (optional)
      const userMembership = await ctx.db.groupMember.findFirst({
        where: {
          groupId: input.groupId,
          userId: userId,
          // role: "ADMIN", // You may want to check if user is admin
        },
      });

      const isCreator = await ctx.db.group.findFirst({
        where: {
          id: input.groupId,
          createdById: userId,
        },
      });

      if (!userMembership && !isCreator) {
        throw new Error(
          "You don't have permission to add members to this group",
        );
      }

      // Add members to the group
      const newMembers = await ctx.db.groupMember.createMany({
        data: input.memberIds.map((memberId) => ({
          groupId: input.groupId,
          userId: memberId,
          role: "MEMBER", // Default role for new members
        })),
        skipDuplicates: true, // Skip if the member is already in the group
      });

      return newMembers;
    }),

  removeMembers: protectedProcedure
    .input(
      z.object({
        groupId: z.string().nonempty(),
        memberIds: z.array(z.string().nonempty()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;

      if (!userId) throw new Error("Not authenticated");

      // Check if user has permission to remove members
      const userMembership = await ctx.db.groupMember.findFirst({
        where: {
          groupId: input.groupId,
          userId: userId,
          // role: "ADMIN", // You may want to check if user is admin
        },
      });

      const isCreator = await ctx.db.group.findFirst({
        where: {
          id: input.groupId,
          createdById: userId,
        },
      });

      if (!userMembership && !isCreator) {
        throw new Error(
          "You don't have permission to remove members from this group",
        );
      }

      // Remove members from the group
      const removedMembers = await ctx.db.groupMember.deleteMany({
        where: {
          groupId: input.groupId,
          userId: {
            in: input.memberIds,
          },
        },
      });

      return removedMembers;
    }),

  deleteGroup: protectedProcedure
    .input(
      z.object({
        groupId: z.string().nonempty(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;

      if (!userId) throw new Error("Not authenticated");

      // Check if user has permission to delete the group
      const userMembership = await ctx.db.groupMember.findFirst({
        where: {
          groupId: input.groupId,
          userId: userId,
          role: "ADMIN", // You may want to check if user is admin
        },
      });

      if (!userMembership) {
        throw new Error("You don't have permission to delete this group");
      }

      // 1. Delete all group messages
      await ctx.db.groupMessage.deleteMany({
        where: {
          groupId: input.groupId,
        },
      });

      // 2. Delete all group tasks
      await ctx.db.groupTask.deleteMany({
        where: {
          groupId: input.groupId,
        },
      });

      // 3. Delete all group media
      await ctx.db.groupMedia.deleteMany({
        where: {
          groupId: input.groupId,
        },
      });

      // 4. Delete all group members
      await ctx.db.groupMember.deleteMany({
        where: {
          groupId: input.groupId,
        },
      });

      // 5. Finally delete the group itself
      const deletedGroup = await ctx.db.group.delete({
        where: {
          id: input.groupId,
        },
      });

      return deletedGroup;
    }),

  getUserGroupRole: protectedProcedure
    .input(
      z.object({
        groupId: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;

      if (!userId) throw new Error("Not authenticated");

      const groupMember = await ctx.db.groupMember.findFirst({
        where: {
          groupId: input.groupId,
          userId: userId,
        },
      });

      return groupMember?.role ?? null;
    }),

  getGroupMedia: protectedProcedure
    .input(
      z.object({
        groupId: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;

      if (!userId) throw new Error("Not authenticated");

      // Check if user is a member of the group
      const isMember = await ctx.db.groupMember.findFirst({
        where: {
          groupId: input.groupId,
          userId,
        },
      });

      if (!isMember) {
        throw new Error(
          "You don't have permission to view media in this group",
        );
      }

      const media = await ctx.db.groupMedia.findMany({
        where: {
          groupId: input.groupId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return media.map((item) => ({
        id: item.id,
        mediaType: item.mediaType,
        mediaUrl: item.mediaUrl,
        createdAt: item.createdAt,
        createdById: item.createdById,
        createdByName: item.createdBy.firstName
          ? `${item.createdBy.firstName} ${item.createdBy.lastName || ""}`
          : "Unknown",
        fileName: item.mediaUrl.split("/").pop() || "File",
      }));
    }),

  deleteMedia: protectedProcedure
    .input(
      z.object({
        mediaId: z.string().nonempty(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;

      if (!userId) throw new Error("Not authenticated");

      // Find the media to get the group ID and the media URL
      const media = await ctx.db.groupMedia.findUnique({
        where: { id: input.mediaId },
        include: {
          group: {
            select: {
              createdById: true,
            },
          },
        },
      });

      if (!media) {
        throw new Error("Media not found");
      }

      // Check permissions (as you already have)
      const isCreator = media.createdById === userId;
      const isGroupCreator = media.group.createdById === userId;

      const isAdmin = await ctx.db.groupMember.findFirst({
        where: {
          groupId: media.groupId,
          userId: userId,
          role: "ADMIN",
        },
      });

      if (!isCreator && !isGroupCreator && !isAdmin) {
        throw new Error("You don't have permission to delete this media");
      }

      // Extract the key from the media URL
      // The key is everything after the bucket name in the S3 URL
      const mediaUrl = media.mediaUrl;
      const urlParts = mediaUrl.split("/");
      // Find the index after the bucket name or extract from the path as needed
      // This depends on your URL structure
      const key = mediaUrl.includes("group-media")
        ? `group-media/${urlParts[urlParts.length - 1]}`
        : urlParts[urlParts.length - 1];

      // Delete the file from S3
      if (!key) {
        throw new Error("Invalid key for S3 deletion");
      }
      const s3DeleteResult = await deleteFileFromS3(key);

      if (s3DeleteResult.failure) {
        console.error("Error deleting file from S3:", s3DeleteResult.failure);
        // You can decide whether to continue with database deletion or throw an error
        // throw new Error(s3DeleteResult.failure);
      }

      // Delete the media entry from the database
      const deletedMedia = await ctx.db.groupMedia.delete({
        where: { id: input.mediaId },
      });

      // Also find and delete any messages that reference this media
      await ctx.db.groupMessage.deleteMany({
        where: {
          groupId: media.groupId,
          mediaUrl: media.mediaUrl,
        },
      });

      return deletedMedia;
    }),
});
