import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { waitUntil } from "@vercel/functions";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/server/db";
import { getAccountDetails, getAurinkoToken } from "@/lib/aurinko";
import { env } from "@/env";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  if (status !== "success")
    return NextResponse.json(
      { error: "Account connection failed" },
      { status: 400 },
    );

  const code = params.get("code");
  const token = await getAurinkoToken(code as string);
  if (!token)
    return NextResponse.json(
      { error: "Failed to fetch token" },
      { status: 400 },
    );
  const accountDetails = await getAccountDetails(token.accessToken);
  console.log("accountDetails", accountDetails);
  console.log("token", token);

  const user = await db.user.findFirst({
    where: {
      email: accountDetails.email,
    },
  });

  if (!user || !user.id)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  await db.account.upsert({
    where: { id: token.accountId.toString() },
    create: {
      id: token.accountId.toString(),
      userId: user?.id,
      token: token.accessToken,
      provider: "Aurinko",
      emailAddress: accountDetails.email,
      name: accountDetails.name,
    },
    update: {
      token: token.accessToken,
    },
  });
  waitUntil(
    axios
      .post(`${env.NEXT_PUBLIC_URL}/api/initial-sync`, {
        accountId: token.accountId.toString(),
        userId: user.id,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err.response.data);
      }),
  );

  return NextResponse.redirect(new URL("/", req.url));
};
