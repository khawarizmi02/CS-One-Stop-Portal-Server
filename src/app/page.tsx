import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { api, HydrateClient } from "@/trpc/server";
import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <div>
      <div>Hello Khawa</div>
      <Button variant="outline">click</Button>
    </div>
  );
}
