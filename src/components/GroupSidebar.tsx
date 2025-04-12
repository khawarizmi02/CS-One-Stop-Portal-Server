"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";
import {
  MessageCircleMore,
  ClipboardList,
  Folder,
  CircleChevronLeft,
  UsersRound,
  Trash,
} from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "./ConfirmationDialogs";

interface GroupSidebarProps {
  className?: string;
}

export function GroupSidebar({ className }: GroupSidebarProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { groupId } = useParams();
  const pathname = usePathname();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!groupId || typeof groupId !== "string" || Array.isArray(groupId)) {
    return null;
  }

  const { data: UserRole } = api.group.getUserGroupRole.useQuery({
    groupId: Array.isArray(groupId) ? groupId[0] : groupId || "",
  });

  const { mutate: DeleteGroupMutation } = api.group.deleteGroup.useMutation({
    onSuccess: () => {
      toast({
        title: "Group deleted",
        description: "The group has been deleted successfully.",
        variant: "default",
      });
      router.push("/group");
    },
    onError: (error) => {
      toast({
        title: "Error deleting group",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    DeleteGroupMutation({
      groupId: Array.isArray(groupId) ? groupId[0] : groupId,
    });
    setIsDeleteDialogOpen(false);
  };

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
                ? "bg-gray-200 text-black"
                : "hover:bg-gray-100",
            )}
          >
            {item.icon} {item.name}
          </Link>
        ))}
        <div>
          {UserRole === "ADMIN" && (
            <button
              className="mt-4 flex w-full cursor-pointer flex-row items-center gap-2 rounded-md border-2 border-red-500 p-2 text-red-500 transition-colors duration-200 hover:bg-muted hover:text-red-600"
              onClick={handleDeleteClick}
            >
              <Trash className="h-4 w-4" />
              Delete Group
            </button>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Group"
        description="Are you sure you want to delete this group? This action will delete all messages, tasks, media, and cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      />
    </div>
  );
}
