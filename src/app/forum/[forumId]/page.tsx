"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { CircleChevronLeft } from "lucide-react";

import { api } from "@/trpc/react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import CommentItem from "@/components/CommentItem";

import { DefaultImage } from "@/constant";
import dayjs from "dayjs";

const ForumContent = () => {
  const { forumId } = useParams();
  const router = useRouter();

  if (!forumId || typeof forumId !== "string" || Array.isArray(forumId)) {
    return null;
  }

  const { data: forum, isLoading } = api.forum.getForumById.useQuery({
    id: forumId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto flex flex-col gap-6 px-6 py-6">
      <section className="flex flex-row items-center gap-2">
        <CircleChevronLeft onClick={() => router.back()} />
        <Avatar className="h-[60px] w-[60px]">
          <AvatarImage
            alt={`user-${forum?.createdBy.firstName}-${forum?.createdBy.lastName}`}
            src={forum?.createdBy.imageUrl ?? DefaultImage.src}
          />
        </Avatar>
        <div>
          <p>
            {forum?.createdBy.firstName} {forum?.createdBy.lastName}
          </p>
          <p>{dayjs(forum?.createdAt).fromNow()}</p>
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <h2>{forum?.title}</h2>
        <p>{forum?.description}</p>
        {forum?.imageUrl && <Image src={forum?.imageUrl} alt="forum image" />}
        <Textarea
          placeholder="Add a comment"
          // onChange={() => console.log("helloij")}
        />
      </section>
      <section className="flex w-full flex-col gap-6">
        {forum?.Comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </section>
    </div>
  );
};

export default ForumContent;
