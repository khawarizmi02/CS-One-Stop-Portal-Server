// link/api/clerk/webhook

import { Prisma } from "@prisma/client";
import { db } from "@/server/db";

export const POST = async (req: Request) => {
  const { data } = await req.json();
  console.log("Received event", data);

  const email = data.email_addresses[0].email_address;
  const firstName = data.first_name;
  const lastName = data.last_name;
  const userId = data.id;
	const clerkId =  data.id;
	const role = 'user'

  const user: Prisma.UserCreateInput = {
		email,
		firstName,
		lastName,
		clerkId,
		role
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
