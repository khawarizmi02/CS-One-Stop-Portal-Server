import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { getRole } from "@/utils/roles";

export async function GET() {
  const role = await getRole();
  console.log(role);
  // res.status(200).json({ role });
  return new NextResponse(JSON.stringify({ role }));
}
