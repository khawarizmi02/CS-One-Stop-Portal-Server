import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const taskRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.db.groupTask.findMany({
      take: 50,
    });

    return tasks;
  }),

  getByGroupId: protectedProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tasks = await ctx.db.groupTask.findMany({
        where: {
          groupId: input.id,
        },
        take: 50,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          createdBy: true,
        },
      });

      return tasks;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().nonempty(),
        description: z.string().optional(),
        groupId: z.string().nonempty(),
        dueDate: z.string().datetime(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;

      if (!userId) throw new Error("Not authenticated");

      const userExists = await ctx.db.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) throw new Error("User not found");

      const groupExist = await ctx.db.group.findUnique({
        where: { id: input.groupId },
      });

      if (!groupExist || !groupExist.members)
        throw new Error("Group not found");

      const userIsGroupMember =
        Array.isArray(groupExist.members) &&
        groupExist.members.includes(userId);

      if (!userIsGroupMember)
        throw new Error("User is not a member of the group");

      const task = await ctx.db.groupTask.create({
        data: {
          title: input.title,
          description: input.description,
          groupId: input.groupId,
          createdById: userId,
          dueDate: input.dueDate,
        },
      });

      return task;
    }),

  update: protectedProcedure
    .input(
      z.object({
        taskId: z.string().nonempty(),
        taskStatus: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = ctx.db.groupTask.update({
        where: { id: input.taskId },
        data: {
          completed: input.taskStatus,
        },
      });
      return task;
    }),
});
