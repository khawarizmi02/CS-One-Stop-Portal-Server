"use server";
import axios from "axios";
import { auth } from "@clerk/nextjs/server";

import { env } from "@/env";
import { EmailMessage } from "./types";
import { db } from "@/server/db";

export const getAurinkoAuthUrl = async (
  serviceType: "Google" | "Office365",
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  let recycle = "false";
  let accountId = "";

  console.log("serviceType", serviceType);

  // Get user email
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      email: true,
    },
  });

  const authEmail = user?.email;

  if (!authEmail) {
    throw new Error("User email not found");
  }

  // Check user has an account
  const account = await db.account.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (account) {
    recycle = "true";
    accountId = account?.id as string;
  }

  const params = new URLSearchParams({
    clientId: env.AURINKO_CLIENT_ID as string,
    serviceType,
    scope: [
      "Calendar.Read",
      "Calendar.ReadWrite",
      "Mail.Read",
      "Mail.ReadWrite",
      "Mail.Send",
      "Mail.Drafts",
      "Mail.All",
    ].join(" "),
    responseType: "code",
    nativeScopes:
      serviceType === "Office365"
        ? [
            "https://graph.microsoft.com/Calendars.ReadWrite",
            "https://graph.microsoft.com/email",
            "https://graph.microsoft.com/Mail.ReadWrite",
            "https://graph.microsoft.com/Mail.Send",
            "https://graph.microsoft.com/User.Read",
            "offline_access",
          ].join(" ")
        : [
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/gmail.modify",
            "https://www.googleapis.com/auth/gmail.compose",
            "https://www.googleapis.com/auth/gmail.send",
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/calendar",
          ].join(" "),
    ensureScopes: "true",
    ensureAccess: "true",
    returnUrl: `${env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
  });

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};

export const getAurinkoToken = async (code: string) => {
  try {
    const response = await axios.post(
      `https://api.aurinko.io/v1/auth/token/${code}`,
      {},
      {
        auth: {
          username: env.AURINKO_CLIENT_ID as string,
          password: env.AURINKO_CLIENT_SECRET as string,
        },
      },
    );

    return response.data as {
      accountId: number;
      accessToken: string;
      userId: string;
      userSession: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching Aurinko token:", error.response?.data);
    } else {
      console.error("Unexpected error fetching Aurinko token:", error);
    }
  }
};

export const getAccountDetails = async (accessToken: string) => {
  try {
    const response = await axios.get(`https://api.aurinko.io/v1/account`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data as {
      email: string;
      name: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching account details:", error.response?.data);
    } else {
      console.error("Unexpected error fetching account details:", error);
    }
    throw error;
  }
};

export const getEmailDetails = async (accessToken: string, emailId: string) => {
  try {
    const response = await axios.get<EmailMessage>(
      `https://api.aurinko.io/v1/email/messages/${emailId}`,
      {
        params: {
          loadInlines: true,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching email details:", error.response?.data);
    } else {
      console.error("Unexpected error fetching email details:", error);
    }
    throw error;
  }
};
