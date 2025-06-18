import { z } from "zod";

// Email Module
export interface SyncResponse {
  syncUpdatedToken: string;
  syncDeletedToken: string;
  ready: boolean;
}
export interface SyncUpdatedResponse {
  nextPageToken?: string;
  nextDeltaToken: string;
  length: number;
  records: EmailMessage[];
}

export const emailAddressSchema = z.object({
  name: z.string(),
  address: z.string(),
});

export interface EmailMessage {
  id: string;
  threadId: string;
  createdTime: string;
  lastModifiedTime: string;
  sentAt: string;
  receivedAt: string;
  internetMessageId: string;
  subject: string;
  sysLabels: Array<
    | "junk"
    | "trash"
    | "sent"
    | "inbox"
    | "unread"
    | "flagged"
    | "important"
    | "draft"
  >;
  keywords: string[];
  sysClassifications: Array<
    "personal" | "social" | "promotions" | "updates" | "forums"
  >;
  sensitivity: "normal" | "private" | "personal" | "confidential";
  meetingMessageMethod?: "request" | "reply" | "cancel" | "counter" | "other";
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  replyTo: EmailAddress[];
  hasAttachments: boolean;
  body?: string;
  bodySnippet?: string;
  attachments: EmailAttachment[];
  inReplyTo?: string;
  references?: string;
  threadIndex?: string;
  internetHeaders: EmailHeader[];
  nativeProperties: Record<string, string>;
  folderId?: string;
  omitted: Array<
    "threadId" | "body" | "attachments" | "recipients" | "internetHeaders"
  >;
}

export interface EmailAddress {
  name?: string;
  address: string;
  raw?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  inline: boolean;
  contentId?: string;
  content?: string;
  contentLocation?: string;
}

export interface EmailHeader {
  name: string;
  value: string;
}

// Calendar Module
export interface SyncUpdatedCalendarResponse {
  nextPageToken?: string;
  nextDeltaToken: string;
  length: number;
  records: CalendarEvent[];
}

export interface CalendarEvent {
  id: string;
  etag: string;
  calendarId: string;
  createdTime: string; // <date-time>
  lastModifiedTime: string; // <date-time>
  subject: string;
  description?: string;
  location?: string;
  start: {
    dateOnly?: string; // <date>
    dateTime?: string; // <date-time>
    timezone?: string;
  };
  end: {
    dateOnly?: string; // <date>
    dateTime?: string; // <date-time>
    timezone?: string;
  };
  organizer: {
    id: string;
    emailAddress: EmailAddress;
  };
  meetingInfo?: {
    canceled: boolean;
    attendees?: Array<{
      id: string;
      emailAddress: EmailAddress;
      type: "required" | "optional" | "resource";
      response: "accepted" | "tentative" | "declined";
      comment?: string;
      attendeePermissions?: Array<"inviteOthers" | "modify" | "seeOthers">;
    }>;
    onlineMeetingProvider?: string;
    onlineMeetingDetails?: {
      url?: string;
      phone?: string;
      pin?: string;
      regionCode?: string;
      sip?: string;
      infoUrl?: string;
    };
  };

  recurrenceType: "single" | "master" | "occurrence";
  recurrence?: EventRecurrence;
  reminder?: {
    useDefault?: boolean; // Supported only for Google
    overrides?: Array<{
      minutes: number;
    }>;
  };
  occurrenceInfo?: EventOccurrenceInfo;
  iCalUid: string;
  globalId: string;
  showAs: "free" | "busy" | "tentative" | "outOfOffice" | "unknown";
  sensitivity: "normal" | "private" | "personal" | "confidential";
  categories?: string[];
  htmlLink?: string;
  hasAttachments: boolean;
  attachments?: Array<EmailAttachment>;
  omitted?: Array<"description" | "attendees" | "attachments">;
}

export interface EventRecurrence {
  original: "simple" | "ical";
  ical?: {
    rules: string[];
    recurrenceStart?: {
      dateOnly?: string; // <date>
      dateTime?: string; // <date-time>
      timezone?: string;
    };
  };

  simple?: {
    pattern: {
      frequency:
        | "daily"
        | "weekly"
        | "monthly"
        | "monthlyRelative"
        | "yearly"
        | "yearlyRelative";
      interval?: number; // Default: 1
      daysOfWeek?: Array<
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
      >;
      weekStart?: "monday" | "sunday";
      dayOfMonth?: number; // [1..31]
      monthOfYear?: number; // [1..12]
      instance?: "first" | "second" | "third" | "fourth" | "last";
    };
    range?: {
      type: "byDate" | "byCount" | "unbounded";
      recurrenceStart?: {
        dateOnly?: string; // <date>
        dateTime?: string; // <date-time>
        timezone?: string;
      };
      recurrenceEnd?: string; // <date>
      count?: number; // >= 1
    };
    patternExclusions?: Array<{
      dateOnly?: string; // <date>
      dateTime?: string; // <date-time>
      timezone?: string;
    }>;
  };
}

interface EventOccurrenceInfo {
  id: string;
  type: "regular" | "modified" | "deleted";
  originalStart?: {
    dateOnly?: string; // <date>
    dateTime?: string; // <date-time>
    timezone?: string;
  };
  start?: {
    dateOnly?: string; // <date>
    dateTime?: string; // <date-time>
    timezone?: string;
  };
  masterId?: string;
}

export interface CreateEvent {
  subject: string;
  description?: string;
  location?: string;
  start: {
    dateOnly?: string; // <date>
    dateTime: string;
    timezone: string;
  };
  end: {
    dateOnly?: string; // <date>
    dateTime: string;
    timezone: string;
  };
  meetingInfo?: {
    attendees?: Array<{
      id: string;
      emailAddress: {
        name?: string;
        address: string;
      };
      type: "required" | "optional" | "resource";
    }>;
    response?: "noResponse" | "declined" | "tentative" | "accepted";
  };

  occurrenceInfo?: EventOccurrenceInfo;

  showAs?: "free" | "busy" | "tentative" | "outOfOffice" | "unknown";
  sensitivity?: "normal" | "private" | "personal" | "confidential";
}
