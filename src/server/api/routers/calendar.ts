import Account from "@/lib/account";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { authoriseAccountAccess } from "./mail";
import { z } from "zod";

export const calendarRouter = createTRPCRouter({
  createEvent: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.auth?.userId;

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.account.findFirst({
      where: {
        userId: ctx.auth?.userId ?? undefined,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = new Account(user.token);

    // Example event creation logic
    // const event = await account.createCalendar({});

    if (!event) {
      throw new Error("Failed to create event");
    }

    return event;
  }),

  syncEvents: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;

      if (!userId) {
        throw new Error("Not authenticated");
      }

      const user = await ctx.db.account.findFirst({
        where: {
          userId: ctx.auth?.userId ?? undefined,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const authAccount = await authoriseAccountAccess(input.accountId, userId);
      if (!authAccount) throw new Error("Invalid token");
      const account = new Account(user.token);

      account.syncCalendarEvents();
    }),

  getEvents: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        searchValue: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;

      if (!userId) {
        throw new Error("Not authenticated");
      }

      const user = await ctx.db.account.findFirst({
        where: {
          userId: ctx.auth?.userId ?? undefined,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const authAccount = await authoriseAccountAccess(input.accountId, userId);
      if (!authAccount) throw new Error("Invalid token");

      const events = await ctx.db.event.findMany({
        where: {
          accountId: input.accountId,
        },
        orderBy: {
          createdTime: "desc",
        },
        select: {
          id: true,
          subject: true,
          startDate: true,
          endDate: true,
          organizer: true,
          createdTime: true,
          lastModifiedTime: true,
          meetingInfo: true,
        },
      });

      if (!events) {
        throw new Error("Failed to fetch events");
      }

      return events;
    }),

  getEventById: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        eventId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;

      if (!userId) {
        throw new Error("Not authenticated");
      }

      const userExists = await ctx.db.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        throw new Error("User not found");
      }
      const account = await authoriseAccountAccess(input.accountId, userId);
      if (!account) throw new Error("Invalid token");

      const event = await ctx.db.event.findUnique({
        where: {
          id: input.eventId,
          accountId: input.accountId,
        },
        include: {
          attendees: true,
          attachments: true,
        },
      });

      if (!event) throw new Error("Event not found");

      return event;
    }),
});
