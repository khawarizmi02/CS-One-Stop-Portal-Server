import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { updateUserRoleMetadata } from "@/lib/clerk";

export const adminRouter = createTRPCRouter({
  createAppGroup: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        members: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;

      if (!userId) {
        console.error(
          "Authentication error: ctx.auth is undefined or userId is missing",
          ctx.auth,
        );
        throw new Error("Not authenticated");
      }

      const { name, description, members } = input;

      const appGroup = await ctx.db.appGroup.create({
        data: {
          name,
          description,
          createdById: userId,
          members,
        },
      });

      return appGroup;
    }),

  getAppGroups: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth?.userId;
    if (!userId) {
      console.error(
        "Authentication error: ctx.auth is undefined or userId is missing",
        ctx.auth,
      );
      throw new Error("Not authenticated");
    }

    const appGroups = await ctx.db.appGroup.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
          },
        },
        members: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // list the users in the members array
    for (const group of appGroups) {
      // Ensure group.members is an array of strings
      const memberIds = Array.isArray(group.members)
        ? group.members.filter((id): id is string => typeof id === "string")
        : [];
      const users = await ctx.db.user.findMany({
        where: {
          id: {
            in: memberIds,
          },
        },
      });
      group.members = users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }));
    }
    return appGroups;
  }),

  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.auth?.userId;

      if (!userId) {
        console.error(
          "Authentication error: ctx.auth is undefined or userId is missing",
          ctx.auth,
        );
        throw new Error("Not authenticated");
      }

      const student = await ctx.db.user.findMany({
        where: { role: "student" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      });

      const lecturer = await ctx.db.user.findMany({
        where: { role: "lecturer" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      });

      const admin = await ctx.db.user.findMany({
        where: { role: "admin" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      });

      const newUser = await ctx.db.user.findMany({
        where: { role: "new" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      });

      return { student, lecturer, admin, newUser };
    } catch (error) {
      console.error("Error in getUserInfo procedure:", error);
      throw error;
    }
  }),

  getAnnouncementStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.auth?.userId;

      if (!userId) {
        console.error(
          "Authentication error: ctx.auth is undefined or userId is missing",
          ctx.auth,
        );
        throw new Error("Not authenticated");
      }

      const announcement = await ctx.db.announcement.findMany({
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { announcement };
    } catch (error) {
      console.error("Error in getUserInfo procedure:", error);
      throw error;
    }
  }),

  getForumStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.auth?.userId;

      if (!userId) {
        console.error(
          "Authentication error: ctx.auth is undefined or userId is missing",
          ctx.auth,
        );
        throw new Error("Not authenticated");
      }

      const forum = await ctx.db.forum.findMany({
        select: {
          id: true,
          title: true,
          Comments: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { forum };
    } catch (error) {
      console.error("Error in getUserInfo procedure:", error);
      throw error;
    }
  }),

  getGroupStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.auth?.userId;

      if (!userId) {
        console.error(
          "Authentication error: ctx.auth is undefined or userId is missing",
          ctx.auth,
        );
        throw new Error("Not authenticated");
      }

      const group = await ctx.db.group.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          Members: true,
        },
      });

      return { group };
    } catch (error) {
      console.error("Error in getUserInfo procedure:", error);
      throw error;
    }
  }),

  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["student", "lecturer", "admin"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, role } = input;
      // Update the user's role in your database (e.g., using Prisma)
      // await ctx.db.user.update({
      //   where: { id: userId },
      //   data: { role },
      // });
      try {
        await updateUserRoleMetadata({ userId, role });
        return { success: true };
      } catch (error) {
        console.error("Error updating user role", error);
        throw new Error("Failed to update user role");
      }
    }),
});
