import React, { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
import TextEditor, { initialValue } from "@/components/TextEditor";
import { DefaultImage } from "@/constant";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

interface CommentItemProps {
  comment: any;
  depth?: number;
  maxDepth?: number;
  forumId: string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth = 0,
  maxDepth = 5,
  forumId,
}) => {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyValue, setReplyValue] = useState(initialValue);
  const [voteCount, setVoteCount] = useState(0);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  const { mutate } = api.forum.createForumComment.useMutation({
    onSuccess: () => {
      toast({
        title: "Comment created",
        description: "Your comment has been posted successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVote = (direction: "up" | "down") => {
    if (userVote === direction) {
      // Remove vote if clicking the same direction
      setUserVote(null);
      setVoteCount(direction === "up" ? voteCount - 1 : voteCount + 1);
    } else {
      // Change vote direction
      const voteChange = userVote ? 2 : 1;
      setUserVote(direction);
      setVoteCount(
        direction === "up" ? voteCount + voteChange : voteCount - voteChange,
      );
    }
  };

  const handleSubmitReply = () => {
    // Implement reply submission logic
    if (!replyValue) {
      toast({
        title: "Error",
        description: "Reply cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    mutate({
      forumId: forumId,
      content: replyValue,
      parentId: comment.id, // Use the current comment's ID as the parentId
    });
    setIsReplying(false);
    setReplyValue(initialValue);
  };

  // Decide on indentation style based on depth
  const indentationClass =
    depth > 0 ? "border-l-2 border-gray-200 pl-4 ml-4" : "";

  // If we've reached max depth, don't indent further
  const childIndentation = depth < maxDepth ? depth + 1 : maxDepth;

  return (
    <div className={`${isCollapsed ? "" : "px-4 py-3"}`}>
      {isCollapsed ? (
        <div
          className="cursor-pointer p-2 hover:bg-gray-50"
          onClick={() => setIsCollapsed(false)}
        >
          <div className="flex items-center text-sm text-gray-500">
            <div className="mr-2 h-10 w-1 rounded bg-gray-200"></div>
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                alt={`user-${comment.createdBy.firstName || ""}-${comment.createdBy.lastName || ""}`}
                src={comment.createdBy.imageUrl ?? DefaultImage.src}
              />
            </Avatar>
            <span className="mr-2 font-medium">
              {comment.createdBy.firstName} {comment.createdBy.lastName}
            </span>
            <span className="mr-2 text-xs">•</span>
            <span className="text-xs">
              {dayjs(comment.createdAt).fromNow()}
            </span>
          </div>
        </div>
      ) : (
        <div>
          {/* Comment header */}
          <div className="mb-2 flex">
            <div className="mr-2 flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 ${userVote === "up" ? "text-orange-500" : ""}`}
                onClick={() => handleVote("up")}
              >
                <ArrowUp size={14} />
              </Button>

              <span className="my-1 text-xs font-medium">{voteCount}</span>

              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 ${userVote === "down" ? "text-blue-500" : ""}`}
                onClick={() => handleVote("down")}
              >
                <ArrowDown size={14} />
              </Button>
            </div>

            <div className="flex-1">
              {/* User info */}
              <div className="mb-1 flex items-center text-sm">
                <Avatar className="mr-2 h-5 w-5">
                  <AvatarImage
                    alt={`user-${comment.createdBy.firstName || ""}-${comment.createdBy.lastName || ""}`}
                    src={comment.createdBy.imageUrl ?? DefaultImage.src}
                  />
                </Avatar>
                <span className="mr-2 font-medium">
                  {comment.createdBy.firstName} {comment.createdBy.lastName}
                </span>
                <span className="mr-2 text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">
                  {dayjs(comment.createdAt).fromNow()}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-5 w-5"
                  onClick={() => setIsCollapsed(true)}
                >
                  <div className="mr-1 h-1 w-1 rounded-full bg-gray-400"></div>
                  <div className="h-1 w-1 rounded-full bg-gray-400"></div>
                </Button>
              </div>

              {/* Comment content */}
              <div>
                <TextEditor
                  value={comment.content}
                  onChange={() => {}}
                  readOnly={true}
                  className="border-none p-0!"
                />
              </div>

              {/* Comment actions */}
              <div className="mt-1 flex items-center text-xs text-gray-500">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <MessageSquare size={14} className="mr-1" />
                  Reply
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <MoreHorizontal size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>Report</DropdownMenuItem>
                    <DropdownMenuItem>Save</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Reply input */}
              {isReplying && (
                <div className="mt-3">
                  <TextEditor
                    value={replyValue}
                    onChange={setReplyValue}
                    hideToggle={true}
                    placeholder="What are your thoughts?"
                    className="mb-2"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsReplying(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSubmitReply}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Render replies */}
      {!isCollapsed && comment.replies && comment.replies.length > 0 && (
        <div className={indentationClass}>
          {comment.replies.map((reply: any) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={childIndentation}
              maxDepth={maxDepth}
              forumId={forumId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
