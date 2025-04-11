"use client";
import React from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";
import {
  MessageCircleMore,
  ClipboardList,
  Folder,
  CircleChevronLeft,
  UsersRound,
} from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

interface GroupSidebarProps {
  className?: string;
}

export function GroupSidebar({ className }: GroupSidebarProps) {
  const router = useRouter();
  const { groupId } = useParams();
  const pathname = usePathname();

  const groupPage = pathname.split("/")[3]; // Extract the current page (e.g., "chat", "task", etc.)

  if (!groupId || !groupId[0]) return null;

  const { data: GroupInfo } = api.group.getByGroupId.useQuery({
    id: Array.isArray(groupId) ? groupId[0] : groupId,
  });

  const sidebarItems = [
    {
      name: "Chat",
      icon: <MessageCircleMore className="mr-2 h-4 w-4" />,
      href: "chat",
    },
    {
      name: "Task",
      icon: <ClipboardList className="mr-2 h-4 w-4" />,
      href: "task",
    },
    {
      name: "Media",
      icon: <Folder className="mr-2 h-4 w-4" />,
      href: "media",
    },
    {
      name: "Members",
      icon: <UsersRound className="mr-2 h-4 w-4" />,
      href: "members",
    },
  ];

  return (
    <div
      className={cn(
        className,
        "flex w-full flex-col items-start justify-start gap-4 border-r-2 px-3 py-6 text-sidebar-foreground",
      )}
    >
      <div
        onClick={() => {
          router.push("/group");
        }}
        className="flex cursor-pointer flex-row items-center justify-start gap-2"
      >
        <CircleChevronLeft onClick={() => router.push("/group")} />
        All groups
      </div>
      <h2>{GroupInfo?.name}</h2>
      <div className="flex w-full flex-col justify-start gap-2">
        {sidebarItems.map((item, index) => (
          <Link
            href={`/group/${groupId}/${item.href}`}
            key={`${index}-${item.name}`}
            className={cn(
              "flex cursor-pointer flex-row items-start gap-2 rounded-md p-2",
              groupPage === item.href
                ? "bg-gray-200 text-black" // Highlight active item
                : "hover:bg-gray-100",
            )}
          >
            {item.icon} {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
