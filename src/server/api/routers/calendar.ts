import Account from "@/lib/account";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const calendarRouter = createTRPCRouter({
  getCalendars: protectedProcedure.mutation(async ({ ctx }) => {
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

    const calendars = await account.getCalendars({});

    if (!calendars) {
      throw new Error("Failed to fetch calendars");
    }

    /*
     * The Calendars will return an array of calendar objects.
     * Each calendar object will contain details such as id, name, and other metadata.
     * You can then use this data to display the calendars in your application.
     * The important calendar that will be used for creating events is the primary calendar (Calendar).
     * So, this function will find the calendarId with name "Calendar" and return it.
     */

    const calendar = calendars.records.find((cal) => cal.name === "Calendar");

    if (!calendar) {
      throw new Error("Primary calendar not found");
    }

    return calendar;
  }),

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

  startSync: protectedProcedure.mutation(async ({ ctx }) => {
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

    const calendars = await account.getCalendars({});

    if (!calendars) {
      throw new Error("Failed to fetch calendars");
    }

    /*
     * The Calendars will return an array of calendar objects.
     * Each calendar object will contain details such as id, name, and other metadata.
     * You can then use this data to display the calendars in your application.
     * The important calendar that will be used for creating events is the primary calendar (Calendar).
     * So, this function will find the calendarId with name "Calendar" and return it.
     */

    const calendar = calendars.records.find((cal) => cal.name === "Calendar");

    if (!calendar) {
      throw new Error("Primary calendar not found");
    }

    const syncResponse = await account.startSyncCalendar({
      calendarId: calendar.id,
    });
  }),

  syncEvents: protectedProcedure.mutation(async ({ ctx }) => {
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

    // Example event synchronization logic
    const calendarId =
      "AAMkAGViMDYzMGQxLThmMjAtNGE1ZS1hZWY2LWM1ZGQwNzFlZTIzZABGAAAAAABW7UpMa1o4TrlX7_P9wvkaBwCX9qxsigVRSKukONpRuS9dAAAAAAEGAACX9qxsigVRSKukONpRuS9dAAAAAAoKAAA="; // Replace with actual calendar ID
    const syncResponse = await account.syncCalendarEvents({ calendarId });

    if (!syncResponse) {
      throw new Error("Failed to sync events");
    }

    return syncResponse;
  }),

  getEvents: protectedProcedure.query(async ({ ctx }) => {
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

    // Example event fetching logic
    const calendarId =
      "AAMkAGViMDYzMGQxLThmMjAtNGE1ZS1hZWY2LWM1ZGQwNzFlZTIzZABGAAAAAABW7UpMa1o4TrlX7_P9wvkaBwCX9qxsigVRSKukONpRuS9dAAAAAAEGAACX9qxsigVRSKukONpRuS9dAAAAAAoKAAA="; // Replace with actual calendar ID
    const events = await account.getEvents({ calendarId });

    if (!events) {
      throw new Error("Failed to fetch events");
    }

    return events;
  }),
});
