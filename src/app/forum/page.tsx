"use client";
import React from "react";
import { api } from "@/trpc/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import AuthButton from "@/components/AuthButton";
import TextEditor from "@/components/TextEditor";

import { DefaultImage } from "@/constant";
import { Descendant } from "slate";

export default function Forum() {
  const router = useRouter();
  const { data: forumList, isLoading } = api.forum.getAll.useQuery();

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="mb-8 flex items-start justify-between border-b border-gray-500 pb-4">
        <h2>Forums</h2>

        <AuthButton
          roles={["admin", "lecturer"]}
          onClick={() => router.push("/forum/create")}
        >
          Create Forum
        </AuthButton>
      </div>
      <div className="flex flex-col gap-4">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Card className="flex flex-row gap-4 overflow-hidden rounded-lg bg-white p-4 shadow">
              <div className="flex flex-auto flex-col gap-2">
                <div className="flex h-[60px] flex-row items-center justify-start gap-2">
                  <Skeleton className="h-[60px] w-[60px] rounded-full bg-slate-300" />
                  <Skeleton className="h-full w-full bg-slate-300" />
                </div>
                <div className="flex h-full flex-col gap-1">
                  <Skeleton className="h-full w-full bg-slate-300" />
                </div>
              </div>
              <div className="relative flex-none items-end">
                <Skeleton className="h-[164px] w-[253px] rounded-lg bg-slate-300" />
              </div>
            </Card>
          ))}
        {forumList?.map((forum) => (
          <Card
            onClick={() => router.push(`/forum/${forum.id}`)}
            key={forum.id}
            className="flex cursor-pointer flex-row gap-4 overflow-hidden rounded-lg bg-white p-4 shadow hover:bg-gray-100"
          >
            <div className="flex flex-auto flex-col gap-2">
              <div className="flex h-[60px] flex-row items-center justify-start gap-2">
                <Avatar className="h-[60px] w-[60px]">
                  <AvatarImage
                    src={forum.createdBy.imageUrl ?? DefaultImage.src}
                    alt={`user-${forum.createdBy.firstName}-${forum.createdBy.lastName}`}
                  />
                </Avatar>
                <p className="text-muted-foreground">
                  {forum.createdBy.firstName} {forum.createdBy.lastName} •{" "}
                  {dayjs(forum.createdAt).fromNow()}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="line-clamp-1 font-medium">{forum.title}</p>
                <TextEditor
                  value={forum.description}
                  onChange={() => {}}
                  readOnly={true}
                  className="line-clamp-2 font-light"
                />
              </div>
            </div>
            <div className="relative flex-none items-end">
              <Image
                className="rounded-lg object-right"
                src={
                  typeof forum.imageUrl === "string"
                    ? forum.imageUrl
                    : DefaultImage.src
                }
                alt={forum.title}
                width={253}
                height={164}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
