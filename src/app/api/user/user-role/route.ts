import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/server/db";

import { checkRole } from "@/utils/roles";

export async function PATCH(request: Request) {
  try {
    const { userId, role } = await request.json();
    const client = await clerkClient();
    const isAdmin = await checkRole("admin");

    if (!isAdmin) {
      console.log("Permission Denied");
      return NextResponse.json(
        {
          error: "Permission denied. Requester is not an admin.",
        },
        { status: 401 },
      );
    }

    await db.user.update({
      where: {clerkId: userId},
      data: {
        role: role
      }
    })

    const user = await client.users.updateUser(userId, {
      publicMetadata: { role },
    });
    return NextResponse.json({ message: "User update", user });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error updating user" });
  }
}
