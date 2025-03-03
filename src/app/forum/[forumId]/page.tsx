"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import { CircleChevronLeft } from "lucide-react";

import { api } from "@/trpc/react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";

import { DefaultImage } from "@/constant";

const ForumContent = () => {
  const { forumId } = useParams();

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
    <div>
      <div>
        <CircleChevronLeft />
        <Avatar className="h-[60px] w-[60px]">
          <AvatarImage
            alt={`user-${forum?.createdBy.firstName}-${forum?.createdBy.lastName}`}
            src={forum?.createdBy.imageUrl ?? DefaultImage.src}
          />
        </Avatar>
        <div>
          <p>user name</p>
          <p>submitted</p>
        </div>
      </div>
      <div>
        <h1>title</h1>
        <p>content</p>
        <div>image</div>
        <div>CommentText</div>
      </div>
      <div>comment section</div>
    </div>
  );
};

export default ForumContent;
