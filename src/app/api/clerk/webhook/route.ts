// link/api/clerk/webhook

import { Prisma } from "@prisma/client";
import { db } from "@/server/db";

export const POST = async (req: Request) => {
  const { data, type } = await req.json();
  console.log("Received event", data);

  if (type === "user.created") {
    return CreateUser(data);
  }

  if (type === "user.updated") {
    return UpdateUser(data);
  }

  if (type === "user.deleted") {
    return DeleteUser(data);
  }
};

const CreateUser = async (data: any) => {
  const email = data.email_addresses[0].email_address;
  const firstName = data.first_name ?? data.email_addresses[0].email_address;
  const lastName = data.last_name;
  const imageUrl = data.image_url;
  const userId = data.id;
  const clerkId = data.id;
  const role = "user";

  const user: Prisma.UserCreateInput = {
    id: userId,
    email,
    firstName,
    lastName,
    imageUrl,
    clerkId,
    role,
  };

  try {
    await db.user.upsert({
      where: {
        id: userId,
      },
      update: user,
      create: user,
    });
    return new Response("New webhook event received", { status: 200 });
  } catch (error) {
    console.error("Error upserting user", error);
    return new Response("Error upserting user", { status: 500 });
  }
};

const UpdateUser = async (data: any) => {
  const email = data.email_addresses[0].email_address;
  const firstName = data.first_name ?? data.email_addresses[0].email_address;
  const lastName = data.last_name;
  const imageUrl = data.image_url;
  const userId = data.id;
  const clerkId = data.id;
  const role = data.public_metadata.role;

  const user: Prisma.UserCreateInput = {
    id: userId,
    email,
    firstName,
    lastName,
    imageUrl,
    clerkId,
    role,
  };

  try {
    await db.user.update({
      where: {
        id: userId,
      },
      data: user,
    });
    return new Response("New webhook event received", { status: 200 });
  } catch (error) {
    console.error("Error upserting user", error);
    return new Response("Error upserting user", { status: 500 });
  }
};

const DeleteUser = async (data: any) => {
  const userId = data.id;

  try {
    await db.user.delete({
      where: {
        id: userId,
      },
    });
    return new Response("New webhook event received", { status: 200 });
  } catch (error) {
    console.error("Error upserting user", error);
    return new Response("Error upserting user", { status: 500 });
  }
};
