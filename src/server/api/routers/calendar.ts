import Account from "@/lib/account";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { authoriseAccountAccess } from "./mail";
import { z } from "zod";

// Base event data schema - shared between create and update
export const eventDataSchema = z.object({
  subject: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  start: z.object({
    dateOnly: z.string().optional(),
    dateTime: z.string(),
    timezone: z.string(),
  }),
  end: z.object({
    dateOnly: z.string().optional(),
    dateTime: z.string(),
    timezone: z.string(),
  }),
  meetingInfo: z
    .object({
      attendees: z
        .array(
          z.object({
            id: z.string(),
            emailAddress: z.object({
              name: z.string().optional(),
              address: z.string(),
            }),
            type: z.enum(["required", "optional", "resource"]),
          }),
        )
        .optional(),
      response: z
        .enum(["noResponse", "declined", "tentative", "accepted"])
        .optional(),
    })
    .optional(),
  occurrenceInfo: z
    .object({
      id: z.string(),
      type: z.enum(["regular", "modified", "deleted"]),
      originalStart: z
        .object({
          dateOnly: z.string().optional(),
          dateTime: z.string().optional(),
          timezone: z.string().optional(),
        })
        .optional(),
      start: z
        .object({
          dateOnly: z.string().optional(),
          dateTime: z.string().optional(),
          timezone: z.string().optional(),
        })
        .optional(),
      masterId: z.string().optional(),
    })
    .optional(),
  showAs: z
    .enum(["free", "busy", "tentative", "outOfOffice", "unknown"])
    .optional(),
  sensitivity: z
    .enum(["normal", "private", "personal", "confidential"])
    .optional(),
});

// For create - all required fields must be present
const createEventDataSchema = eventDataSchema;

// For update - make most fields optional since you might only update specific fields
const updateEventDataSchema = eventDataSchema;

export const calendarRouter = createTRPCRouter({
  createEvent: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        eventData: createEventDataSchema,
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

      // get the calendarId from the account
      const calendarId = await ctx.db.account.findUnique({
        where: { id: input.accountId },
        select: { calendarId: true },
      });

      if (!calendarId || !calendarId.calendarId)
        throw new Error("Calendar ID not found for the account");

      // Example event creation logic
      const event = await account.createCalendarEvent(
        calendarId?.calendarId,
        input.eventData,
      );

      if (!event) {
        throw new Error("Failed to create event");
      }

      return event;
    }),

  updateEvent: protectedProcedure
    .input(
      z.object({
        calendarId: z.string(),
        eventId: z.string(),
        accountId: z.string(),
        eventData: updateEventDataSchema,
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

      let ifMatch: string | undefined = "";

      // Assuming you have an updateCalendarEvent method in your Account class
      const event = await account.updateCalendarEvent(
        input.calendarId,
        input.eventId,
        input.eventData,
        ifMatch,
      );

      if (!event) {
        throw new Error("Failed to update event");
      }

      return event;
    }),

  deleteEvent: protectedProcedure
    .input(
      z.object({
        calendarId: z.string(),
        eventId: z.string(),
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

      const event = await account.deleteCalendarEvent(
        input.calendarId,
        input.eventId,
      );

      if (!event) {
        throw new Error("Failed to delete event");
      }
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
