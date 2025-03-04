import React from "react";
import { ForumComment as PrismaForumComment } from "@prisma/client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface ForumComment extends PrismaForumComment {
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
  };
  content: string;
  createdAt: Date;
  replies: ForumComment[];
}

const CommentItem: React.FC<{ comment: ForumComment }> = ({ comment }) => {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex h-[60px] flex-row items-center justify-start gap-2">
        <Avatar className="h-[60px] w-[60px]">
          <AvatarImage
            src={comment.createdBy?.imageUrl}
            alt={`user-${comment.createdBy?.firstName}-${comment.createdBy?.lastName}`}
          />
        </Avatar>
        <p className="text-muted-foreground">
          {comment.createdBy.firstName} {comment.createdBy.lastName} •{" "}
          {dayjs(comment.createdAt).fromNow()}
        </p>
      </div>
      <div className="flex w-full flex-col gap-6 pl-[60px]">
        <p>{comment.content}</p>
        <div>
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
