"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { env } from "@/env";

interface updateUserRoleMetadataProps {
  userId?: string;
  role: string;
}

export const updateUserRoleMetadata = async ({
  userId,
  role,
}: updateUserRoleMetadataProps) => {
  // const { userId: authUserId } = await auth();

  // if (!userId) {
  //   console.error("User ID is required");
  //   throw new Error("User ID is required");
  // }
  // if (!role) {
  //   console.error("Role is required");
  //   throw new Error("Role is required");
  // }
  // if (userId !== authUserId) {
  //   console.error("User ID does not match authenticated user");
  //   throw new Error("User ID does not match authenticated user");
  // }
  if (!env.CLERK_SECRET_KEY) {
    console.error("CLERK_SECRET_KEY is not defined");
    throw new Error("CLERK_SECRET_KEY is not defined");
  }
  try {
    const response = await axios.patch(
      `https://api.clerk.com/v1/users/${userId}/metadata`,
      {
        public_metadata: {
          role,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("User metadata updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating user metadata:", error);
    throw error;
  }
};
