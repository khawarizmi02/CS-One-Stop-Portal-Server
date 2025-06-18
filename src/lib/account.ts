import type {
  EmailHeader,
  EmailMessage,
  CalendarEvent,
  SyncResponse,
  SyncUpdatedCalendarResponse,
  SyncUpdatedResponse,
  CreateEvent,
} from "@/lib/types";
import { db } from "@/server/db";
import axios from "axios";
import { syncEmailsToDatabase, syncCalendarsToDatabase } from "./syn-to-db";
import { env } from "@/env";
import { time } from "console";
import { min } from "date-fns";

const API_BASE_URL = env.AURINKO_API_URL;

const TIMEMIN = new Date(
  new Date().getFullYear(),
  new Date().getMonth() - 0,
  1,
).toISOString();
const TIMEMAX = new Date(
  new Date().getFullYear(),
  new Date().getMonth() + 2,
  0, // Last day of the month before the 3rd month ahead
).toISOString();

class Account {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async startSync(daysWithin: number): Promise<SyncResponse> {
    const response = await axios.post<SyncResponse>(
      // `${API_BASE_URL}/email/sync`,
      "https://api.aurinko.io/v1/email/sync",
      {},
      {
        headers: { Authorization: `Bearer ${this.token}` },
        params: {
          daysWithin,
          bodyType: "html",
        },
      },
    );
    return response.data;
  }

  async getCalendarId({
    pageToken,
    withShared = true,
    mode,
  }: {
    pageToken?: string;
    withShared?: boolean;
    mode?: "user" | "group";
  }) {
    try {
      const params: Record<string, string | boolean | undefined> = {
        pageToken,
        withShared,
        mode,
      };

      const response = await axios.get<{
        nextPageToken: string;
        length: number;
        records: Array<{
          id: string;
          name: string;
          owner: string;
          isShared: boolean;
        }>;
      }>(`${API_BASE_URL}/calendars`, {
        headers: { Authorization: `Bearer ${this.token}` },
        params,
      });

      console.log("caledars:", response.data.records);

      let calendarId = response.data.records.find(
        (calendar) => calendar.name === "Calendar",
      )?.id;

      if (response.data.records.length > 0 && response.data.records[0]) {
        calendarId = response.data.records[0].id;
      }

      if (!calendarId) {
        throw new Error("Primary calendar not found");
      }

      return calendarId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error fetching calendar:",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.error("Error fetching calendar:", error);
      }
      throw error;
    }
  }

  async startSyncCalendar({ calendarId }: { calendarId: string }) {
    const params: Record<string, string> = {
      timeMin: TIMEMIN,
      timeMax: TIMEMAX,
    };
    const response = await axios.post<SyncResponse>(
      `${API_BASE_URL}/calendars/${calendarId}/sync`,
      {},
      {
        headers: { Authorization: `Bearer ${this.token}` },
        params,
      },
    );
    return response;
  }

  async getUpdatedEvents({
    calendarId,
    deltaToken,
    pageToken,
  }: {
    calendarId: string;
    deltaToken?: string;
    pageToken?: string;
  }): Promise<SyncUpdatedCalendarResponse> {
    const response = await axios.get<SyncUpdatedCalendarResponse>(
      `${API_BASE_URL}/calendars/${calendarId}/sync/updated`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
        params: {
          deltaToken,
          pageToken,
        },
      },
    );

    return response.data;
  }

  async performInitialSyncCalendar() {
    try {
      // Start the sync process
      const calendarId = await this.getCalendarId({
        mode: "user",
        withShared: false,
      });
      let syncResponse = await this.startSyncCalendar({ calendarId });

      // Wait until the sync is ready
      while (!syncResponse.data.ready) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
        syncResponse = await this.startSyncCalendar({ calendarId });
      }

      console.log("Sync is ready. Tokens:", syncResponse.data);

      // Perform initial sync of updated events
      let storedDeltaToken: string = syncResponse.data.syncUpdatedToken;
      let updatedResponse = await this.getUpdatedEvents({
        calendarId,
        deltaToken: storedDeltaToken,
      });

      if (updatedResponse.nextDeltaToken) {
        storedDeltaToken = updatedResponse.nextDeltaToken;
      }
      let allEvents: SyncUpdatedCalendarResponse["records"] =
        updatedResponse.records;

      // Fetch all pages if there are more
      while (updatedResponse.nextPageToken) {
        updatedResponse = await this.getUpdatedEvents({
          calendarId,
          pageToken: updatedResponse.nextPageToken,
        });
        allEvents = allEvents.concat(updatedResponse.records);
        if (updatedResponse.nextDeltaToken) {
          storedDeltaToken = updatedResponse.nextDeltaToken;
        }
      }

      console.log("Initial sync complete. Total events:", allEvents.length);

      // Store the nextDeltaToken for future incremental syncs

      return {
        events: allEvents,
        deltaToken: storedDeltaToken,
        calendarId: calendarId,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error during calendar sync:",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.error("Error during calendar sync:", error);
      }
    }
  }

  async syncEmails() {
    const account = await db.account.findUnique({
      where: {
        token: this.token,
      },
    });
    if (!account) throw new Error("Invalid token");
    if (!account.nextDeltaToken) throw new Error("No delta token");
    let response = await this.getUpdatedEmails({
      deltaToken: account.nextDeltaToken,
    });
    let allEmails: EmailMessage[] = response.records;
    let storedDeltaToken = account.nextDeltaToken;
    if (response.nextDeltaToken) {
      storedDeltaToken = response.nextDeltaToken;
    }
    while (response.nextPageToken) {
      response = await this.getUpdatedEmails({
        pageToken: response.nextPageToken,
      });
      allEmails = allEmails.concat(response.records);
      if (response.nextDeltaToken) {
        storedDeltaToken = response.nextDeltaToken;
      }
    }

    if (!response) throw new Error("Failed to sync emails");

    try {
      await syncEmailsToDatabase(allEmails, account.id);
    } catch (error) {
      throw new Error("Failed to sync emails to database");
    }

    // console.log('syncEmails', response)
    await db.account.update({
      where: {
        id: account.id,
      },
      data: {
        nextDeltaToken: storedDeltaToken,
      },
    });
  }

  async syncCalendarEvents() {
    const account = await db.account.findUnique({
      where: {
        token: this.token,
      },
    });

    if (!account) throw new Error("Invalid token");
    if (!account.nextDeltaTokenCalendar) throw new Error("No delta token");
    if (!account.calendarId) throw new Error("No calendar ID");

    let response = await this.getUpdatedEvents({
      calendarId: account.calendarId,
      deltaToken: account.nextDeltaTokenCalendar,
    });

    let allEvents: CalendarEvent[] = response.records;
    let storedDeltaToken = account.nextDeltaTokenCalendar;
    if (response.nextDeltaToken) {
      storedDeltaToken = response.nextDeltaToken;
    }

    while (response.nextPageToken) {
      response = await this.getUpdatedEvents({
        calendarId: account.calendarId,
        pageToken: response.nextPageToken,
      });
      allEvents = allEvents.concat(response.records);

      if (response.nextDeltaToken) {
        storedDeltaToken = response.nextDeltaToken;
      }
    }
    if (!response) throw new Error("Failed to sync calendar events");
    try {
      await syncCalendarsToDatabase(allEvents, account.calendarId, account.id);
    } catch (error) {
      throw new Error("Failed to sync calendar events to database");
    }

    await db.account.update({
      where: {
        id: account.id,
      },
      data: {
        nextDeltaTokenCalendar: storedDeltaToken,
      },
    });
  }

  async getUpdatedEmails({
    deltaToken,
    pageToken,
  }: {
    deltaToken?: string;
    pageToken?: string;
  }): Promise<SyncUpdatedResponse> {
    console.log("getUpdatedEmails", { deltaToken, pageToken });
    let params: Record<string, string> = {};
    if (deltaToken) {
      params.deltaToken = deltaToken;
    }
    if (pageToken) {
      params.pageToken = pageToken;
    }
    console.log("params", params);
    const response = await axios.get<SyncUpdatedResponse>(
      // `${API_BASE_URL}/email/sync/updated`,
      "https://api.aurinko.io/v1/email/sync/updated",
      {
        headers: { Authorization: `Bearer ${this.token}` },
        params,
      },
    );
    return response.data;
  }

  async performInitialSync() {
    try {
      // Start the sync process
      const daysWithin = 2;
      let syncResponse = await this.startSync(daysWithin);

      // Wait until the sync is ready
      while (!syncResponse.ready) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
        syncResponse = await this.startSync(daysWithin);
      }

      // console.log("Sync is ready. Tokens:", syncResponse);

      // Perform initial sync of updated emails
      let storedDeltaToken: string = syncResponse.syncUpdatedToken;
      let updatedResponse = await this.getUpdatedEmails({
        deltaToken: storedDeltaToken,
      });
      // console.log("updatedResponse", updatedResponse);
      if (updatedResponse.nextDeltaToken) {
        storedDeltaToken = updatedResponse.nextDeltaToken;
      }
      let allEmails: EmailMessage[] = updatedResponse.records;

      // Fetch all pages if there are more
      while (updatedResponse.nextPageToken) {
        updatedResponse = await this.getUpdatedEmails({
          pageToken: updatedResponse.nextPageToken,
        });
        allEmails = allEmails.concat(updatedResponse.records);
        if (updatedResponse.nextDeltaToken) {
          storedDeltaToken = updatedResponse.nextDeltaToken;
        }
      }

      console.log("Initial sync complete. Total emails:", allEmails.length);

      // Store the nextDeltaToken for future incremental syncs

      // Example of using the stored delta token for an incremental sync
      // await this.performIncrementalSync(storedDeltaToken);
      return {
        emails: allEmails,
        deltaToken: storedDeltaToken,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error during sync:",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.error("Error during sync:", error);
      }
    }
  }

  async sendEmail({
    from,
    subject,
    body,
    inReplyTo,
    references,
    threadId,
    to,
    cc,
    bcc,
    replyTo,
  }: {
    from: EmailAddress;
    subject: string;
    body: string;
    inReplyTo?: string;
    references?: string;
    threadId?: string;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    replyTo?: EmailAddress;
  }) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/email/messages`,
        {
          from,
          subject,
          body,
          inReplyTo,
          references,
          threadId,
          to,
          cc,
          bcc,
          replyTo: [replyTo],
        },
        {
          params: {
            returnIds: true,
          },
          headers: { Authorization: `Bearer ${this.token}` },
        },
      );

      console.log("sendmail", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error sending email:",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.error("Error sending email:", error);
      }
      throw error;
    }
  }

  async createCalendarEvent(calendarId: string, eventData: CreateEvent) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/calendars/${calendarId}/events`,
        {
          ...eventData,
        },
        {
          params: {
            notifyAttendees: true,
            returnRecord: true,
          },
          headers: { Authorization: `Bearer ${this.token}` },
        },
      );

      console.log("Calendar event created:", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error creating calendar event:",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.error("Error creating calendar event:", error);
      }
      throw error;
    }
  }

  async updateCalendarEvent(
    calendarId: string,
    eventId: string,
    eventData: CreateEvent,
    ifMatch: string,
  ) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/calendars/${calendarId}/events/${eventId}`,
        {
          ...eventData,
        },
        {
          params: {
            notifyAttendees: true,
            returnRecord: true,
          },
          headers: {
            Authorization: `Bearer ${this.token}`,
            "If-Match": ifMatch,
          },
        },
      );

      console.log("Calendar event updated:", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error updating calendar event:",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.error("Error updating calendar event:", error);
      }
      throw error;
    }
  }

  async deleteCalendarEvent(calendarId: string, eventId: string) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/calendars/${calendarId}/events/${eventId}`,
        {
          params: {
            notifyAttendees: true,
          },
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );

      console.log("Calendar event deleted:", response);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error deleting calendar event:",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.error("Error deleting calendar event:", error);
      }
      throw error;
    }
  }
}
type EmailAddress = {
  name: string;
  address: string;
};

export default Account;
