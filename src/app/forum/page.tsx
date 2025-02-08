"use client";
import React from "react";
import { api } from "@/trpc/react";
import Image from "next/image";
import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

import { DefaultImage } from "@/constant";

const Forum = () => {
  const { data: forumList, isLoading } = api.forum.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log(forumList);

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="mb-8 flex items-start justify-start border-b border-gray-500 pb-4">
        <h2>Forums</h2>
      </div>
      <div className="flex flex-col gap-4">
        {forumList?.map((forum) => (
          <Card
            key={forum.id}
            className="flex flex-row gap-4 overflow-hidden rounded-lg bg-white p-4 shadow"
          >
            <div className="flex flex-auto flex-col gap-2">
              <div className="flex h-[60px] flex-row items-center justify-start gap-2">
                <Avatar className="h-[60px] w-[60px]">
                  <AvatarImage src={DefaultImage.src} alt="khawarizmi" />
                </Avatar>
                <p className="text-muted-foreground">khawarizmi</p>
                <p className="text-muted-foreground">
                  {dayjs(forum.createdAt).fromNow()}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="line-clamp-1 font-medium">{forum.title}</p>
                <p className="line-clamp-2 font-light">{forum.description}</p>
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
};

export default Forum;
