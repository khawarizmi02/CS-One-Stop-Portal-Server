import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: "User not found" });
  }

  // Get the OAuth access token for the user
  const provider = "microsoft";

  const client = await clerkClient();

  const clerkResponse = await client.users.getUserOauthAccessToken(
    userId,
    provider,
  );

  const accessToken = clerkResponse.data[0]?.token || "";

  if (!accessToken) {
    return NextResponse.json(
      { message: "Access token not found" },
      { status: 401 },
    );
  }

  // Fetch the user data from Microsoft Graph API
  const microsoftGraphUrl = "https://graph.microsoft.com/Mail.Read";

  const microsoftResponse = await fetch(microsoftGraphUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Handle the response from Microsoft
  const microsoftData = await microsoftResponse.json();

  return NextResponse.json({ accessToken, microsoftResponse }, { status: 200 });
}
