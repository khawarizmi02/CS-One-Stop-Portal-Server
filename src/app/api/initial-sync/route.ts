import Account from "@/lib/account";
import { syncEmailsToDatabase, syncCalendarsToDatabase } from "@/lib/syn-to-db";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { accountId, userId } = body;
  if (!accountId || !userId)
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });

  console.log("accountId", accountId);
  console.log("userId", userId);

  const dbAccount = await db.account.findUnique({
    where: {
      id: accountId,
      userId,
    },
  });
  if (!dbAccount)
    return NextResponse.json({ error: "ACCOUNT_NOT_FOUND" }, { status: 404 });

  const account = new Account(dbAccount.token);
  // await account.createSubscription();
  const response = await account.performInitialSync();
  if (!response)
    return NextResponse.json({ error: "FAILED_TO_SYNC" }, { status: 500 });

  const { deltaToken, emails } = response;
  await db.account.update({
    where: {
      token: dbAccount.token,
    },
    data: {
      nextDeltaToken: deltaToken,
    },
  });

  const calendarResponse = await account.performInitialSyncCalendar();
  if (!calendarResponse)
    return NextResponse.json(
      { error: "FAILED_TO_SYNC_CALENDAR" },
      { status: 500 },
    );

  const {
    events,
    deltaToken: nextDeltaTokenCalendar,
    calendarId,
  } = calendarResponse;

  await syncEmailsToDatabase(emails, accountId);
  await syncCalendarsToDatabase(events, calendarId, accountId);

  await db.account.update({
    where: {
      token: dbAccount.token,
    },
    data: {
      nextDeltaToken: deltaToken,
      nextDeltaTokenCalendar: nextDeltaTokenCalendar,
      calendarId: calendarId,
    },
  });
  console.log("sync complete", deltaToken);
  return NextResponse.json({ success: true, deltaToken }, { status: 200 });
};
