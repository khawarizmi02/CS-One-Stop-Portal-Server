"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { CircleChevronLeft, Fullscreen } from "lucide-react";

import { api } from "@/trpc/react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import CommentItem from "@/components/CommentItem";
import TextEditor, { initialValue } from "@/components/TextEditor";

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

  const formSchema = z.object({
    description: z.array(z.any()).nonempty("Comment is required"),
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
      <section className="flex w-full flex-col gap-4">
        <h2>{forum?.title}</h2>
        {forum?.imageUrl && (
          <div className="flex justify-center rounded-2xl bg-slate-300">
            <Image
              src={forum?.imageUrl}
              alt={`forum-${forum?.imageUrl}`}
              className="p-auto max-w-sm"
              width={800}
              height={600}
            />
          </div>
        )}
        <TextEditor
          value={forum?.description ?? initialValue}
          onChange={() => {}}
          readOnly={true}
        />
        <TextEditor
          value={initialValue}
          onChange={() => {}}
          placeholder="Add a comment..."
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
