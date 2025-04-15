import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { updateUserRoleMetadata } from "@/lib/clerk";

export const POST = async (req: Request) => {
  const { userId, role } = await req.json();
  console.log("Received event", userId, role);

  if (!userId || !role) {
    return new Response("User ID and role are required", { status: 400 });
  }

  try {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        role,
      },
    });

    // Update user role metadata in Clerk
    await updateUserRoleMetadata({ userId, role });

    return new Response("User role updated successfully", { status: 200 });
  } catch (error) {
    console.error("Error updating user role", error);
    return new Response("Error updating user role", { status: 500 });
  }
};
