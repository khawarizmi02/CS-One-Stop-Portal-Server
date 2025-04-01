import { z } from "zod";

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

    return groups;
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
});
