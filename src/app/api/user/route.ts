import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { checkRole } from "@/utils/roles";

export async function GET() {
	
	const isAdmin = checkRole("admin");
	if (!isAdmin) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const clerk = await clerkClient();
	const users = (await clerk.users.getUserList()).data;

	return new NextResponse(JSON.stringify(users));
}