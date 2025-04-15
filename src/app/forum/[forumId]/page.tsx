"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Share2,
  BookmarkPlus,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { api } from "@/trpc/react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CommentItem from "@/components/CommentItem";
import TextEditor, { initialValue } from "@/components/TextEditor";

import { DefaultImage } from "@/constant";
import { useToast } from "@/hooks/use-toast";

// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);

const ForumContent = () => {
  const { toast } = useToast();
  const { forumId } = useParams();
  const router = useRouter();
  const [commentValue, setCommentValue] = useState(initialValue);
  const [sortOption, setSortOption] = useState("best");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!forumId || typeof forumId !== "string" || Array.isArray(forumId)) {
    return null;
  }

  const {
    data: forum,
    isLoading,
    refetch: refetchForum,
  } = api.forum.getForumById.useQuery({
    id: forumId,
  });

  const createComment = api.forum.createForumComment.useMutation({
    onSuccess: () => {
      // Reset comment field and refetch
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
        variant: "default",
      });
      refetchForum();
      setCommentValue(initialValue);
      setIsSubmitting(false);
    },
    onError: (error) => {
      // Handle error
      toast({
        title: "Error posting comment",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const formSchema = z.object({
    description: z.array(z.any()).nonempty("Comment is required"),
  });

  const handleSubmitComment = () => {
    if (commentValue === initialValue) return;

    setIsSubmitting(true);
    createComment.mutate({
      forumId: forumId,
      content: commentValue,
    });
  };

  const getSortedComments = () => {
    if (!forum?.Comments) return [];

    let sortedComments = [...forum.Comments];

    switch (sortOption) {
      case "best":
        // Sort by score (would require an actual scoring mechanism)
        return sortedComments;
      case "new":
        return sortedComments.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case "old":
        return sortedComments.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      default:
        return sortedComments;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Forum not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Navigation bar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h2 className="truncate text-lg font-medium">{forum.title}</h2>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto mt-4 max-w-3xl px-4">
        {/* Post card */}
        <div className="mb-4 overflow-hidden rounded-md border border-gray-200 bg-white">
          {/* Post header */}
          <div className="border-b border-gray-100 p-3 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  alt={`user-${forum?.createdBy.firstName || ""}-${forum?.createdBy.lastName || ""}`}
                  src={forum?.createdBy.imageUrl ?? DefaultImage.src}
                />
              </Avatar>
              <span className="font-medium text-gray-900">
                {forum?.createdBy.firstName} {forum?.createdBy.lastName}
              </span>
              <span className="text-xs">•</span>
              <span className="text-xs">
                {dayjs(forum?.createdAt).fromNow()}
              </span>
            </div>
          </div>

          {/* Post title */}
          <div className="p-3 pt-2">
            <h1 className="mb-2 text-xl font-bold">{forum.title}</h1>
          </div>

          {/* Post image if exists */}
          {forum.imageUrl && (
            <div className="border-t border-b border-gray-100">
              <div className="relative flex justify-center bg-gray-50">
                <Image
                  src={forum.imageUrl}
                  alt={`forum-${forum.title}`}
                  width={800}
                  height={600}
                  className="max-h-[500px] object-contain"
                />
              </div>
            </div>
          )}

          {/* Post content */}
          <div className="p-3">
            <TextEditor
              value={forum?.description ?? initialValue}
              onChange={() => {}}
              readOnly={true}
              className="border-none"
            />
          </div>

          {/* Post actions */}
          <div className="flex items-center border-t border-gray-100 px-3 py-2">
            <div className="mr-4 flex items-center rounded-full bg-gray-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <ArrowUp size={16} />
              </Button>
              <span className="px-1 text-sm font-medium">0</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <ArrowDown size={16} />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-gray-500"
            >
              <MessageSquare size={16} />
              <span>{forum.Comments.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-gray-500"
            >
              <Share2 size={16} />
              <span>Share</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-gray-500"
            >
              <BookmarkPlus size={16} />
              <span>Save</span>
            </Button>

            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Report</DropdownMenuItem>
                  <DropdownMenuItem>Hide</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Comment input */}
        <div className="mb-4 rounded-md border border-gray-200 bg-white p-3">
          <p className="mb-2 text-sm text-gray-500">
            Comment to{" "}
            <span className="font-medium text-blue-500">
              {forum?.createdBy.firstName} {forum?.createdBy.lastName}
            </span>
          </p>
          <TextEditor
            value={commentValue}
            onChange={setCommentValue}
            hideToggle={true}
            placeholder="What are your thoughts?"
            className="mb-3"
          />
          <div className="flex justify-end">
            <Button
              variant="default"
              disabled={isSubmitting}
              onClick={handleSubmitComment}
            >
              {isSubmitting ? "Posting..." : "Comment"}
            </Button>
          </div>
        </div>

        {/* Comments section */}
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
          {/* Comments header */}
          <div className="border-b border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{forum.Comments.length} Comments</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <span>
                      Sort:{" "}
                      {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
                    </span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortOption("best")}>
                    Best
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("new")}>
                    New
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("old")}>
                    Old
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Comments list */}
          <div className="divide-y divide-gray-100">
            {getSortedComments().length > 0 ? (
              getSortedComments().map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  forumId={forumId}
                />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumContent;
