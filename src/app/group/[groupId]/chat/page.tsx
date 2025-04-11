"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircleMore,
  Upload,
  X,
  Plus,
  PlusCircle,
  AtSign,
  Hash,
  Smile,
} from "lucide-react";
import { getSignedURL } from "@/actions/s3Actions";
import { api } from "@/trpc/react";
import { type User, type GroupMessage } from "@prisma/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import { useToast } from "@/hooks/use-toast";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useParams } from "next/navigation";

type MessageEvent = GroupMessage & {
  createdBy: User;
};

const ChatRoom = () => {
  const { groupId } = useParams();
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageEvent[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const id = Array.isArray(groupId) ? groupId[0] : groupId;
  if (!id) throw new Error("Id is not exist!");

  const { data: initialMessages, refetch } = api.message.getMessages.useQuery({
    groupId: id,
  });

  const { mutate: sendMessage } = api.message.sendMessage.useMutation({
    onSuccess: () => {
      refetch();
      setInput("");
      setSelectedFile(null);
    },
    onError: (err) => {
      toast({
        title: "Uh oh! message cannot be send",
        description: `${err.message}. Please try again later.`,
        variant: "destructive",
      });
    },
  });

  const handleSend = async () => {
    if (selectedFile) {
      try {
        const fileName = `${selectedFile.name}`;
        const signedURLResult = await getSignedURL(
          fileName,
          selectedFile.type,
          `groups/${id}/media`,
        );

        if (signedURLResult.failure) {
          toast({
            title: "File upload failed",
            description: signedURLResult.failure,
            variant: "destructive",
          });
          return;
        }

        const { url } = signedURLResult.success!;
        const uploadResponse = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload: ${uploadResponse.statusText}`);
        }

        const mediaUrl = url.split("?")[0];
        sendMessage({
          groupId: id,
          content: input,
          messageType: "file",
          mediaUrl,
        });
      } catch (error) {
        toast({
          title: "File upload failed",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    } else if (input.trim()) {
      sendMessage({ groupId: id, content: input, messageType: "text" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    if (initialMessages) {
      setMessages(initialMessages);
    }
    return () => clearInterval(interval);
  }, [initialMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Group consecutive messages by same user
  const getGroupedMessages = () => {
    const result: MessageEvent[][] = [];
    let currentGroup: MessageEvent[] = [];

    messages.forEach((message, index) => {
      if (index === 0) {
        currentGroup = [message];
      } else {
        const prevMessage = messages[index - 1];
        const timeDiff = dayjs(message.createdAt).diff(
          prevMessage?.createdAt,
          "minute",
        );

        if (message.createdById === prevMessage?.createdById && timeDiff < 5) {
          currentGroup.push(message);
        } else {
          result.push([...currentGroup]);
          currentGroup = [message];
        }
      }
    });

    if (currentGroup.length > 0) {
      result.push(currentGroup);
    }

    return result;
  };

  const messageGroups = getGroupedMessages();

  return (
    <div className="flex h-screen w-full flex-col pt-6 text-gray-800">
      {/* Server header */}
      <div className="flex h-12 items-center border-b border-[#e3e5e8] bg-white px-4 shadow-sm">
        <Hash className="mr-2 h-5 w-5 text-gray-500" />
        <h3 className="font-semibold">chat-room</h3>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 overflow-y-auto bg-[#f2f3f5] px-4">
        <div className="py-4">
          {messageGroups.map((group, groupIndex) => {
            const firstMessage = group[0];
            return (
              <div
                key={groupIndex}
                className="mb-4 rounded-md p-2 hover:bg-[#e9eaeb]"
              >
                <div className="flex items-start gap-3 pt-1">
                  <Avatar className="h-10 w-10 rounded-full">
                    <AvatarImage
                      src={firstMessage?.createdBy.imageUrl ?? ""}
                      alt={`${firstMessage?.createdBy.firstName} ${firstMessage?.createdBy.lastName ?? ""}`}
                    />
                    <AvatarFallback className="bg-[#5865f2] text-white">
                      {firstMessage?.createdBy.firstName?.[0]}
                      {firstMessage?.createdBy.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-[#060607]">
                        {firstMessage?.createdBy.firstName}{" "}
                        {firstMessage?.createdBy.lastName ?? ""}
                      </span>
                      <span className="text-xs text-gray-500">
                        {dayjs(firstMessage?.createdAt).format("h:mm A")}
                      </span>
                    </div>

                    <div className="mt-1">
                      {group.map((msg, msgIndex) => (
                        <div
                          key={msg.id}
                          className={msgIndex > 0 ? "mt-0.5" : ""}
                        >
                          {msg.messageType === "text" && (
                            <p className="text-sm text-gray-800">
                              {msg.content}
                            </p>
                          )}

                          {msg.messageType === "image" && (
                            <div className="mt-1 max-w-sm rounded-md">
                              <img
                                src={msg.mediaUrl ?? ""}
                                alt="Shared content"
                                className="max-h-80 rounded-md"
                              />
                              {msg.content && (
                                <p className="mt-1 text-sm text-gray-800">
                                  {msg.content}
                                </p>
                              )}
                            </div>
                          )}

                          {msg.messageType === "file" && (
                            <div className="mt-1 inline-flex items-center gap-2 rounded-md bg-[#e3e5e8] p-2 text-sm">
                              <a
                                href={msg.mediaUrl ?? undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#00aff4] hover:underline"
                              >
                                {msg.mediaUrl?.split("/").pop() ||
                                  "Download File"}
                              </a>
                              {msg.content && (
                                <span className="text-gray-700">
                                  {msg.content}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="bg-[#f2f3f5] px-4 pb-6 pt-2">
        {selectedFile && (
          <div className="mb-2 rounded-md border border-[#e3e5e8] bg-white p-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                className="h-6 w-6 rounded-full p-0 text-gray-500 hover:bg-[#e3e5e8] hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <PlusCircle className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700" />
          </div>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message #chat-room"
            className="border border-[#e3e5e8] bg-white pl-12 pr-12 text-gray-800 placeholder-gray-500 focus-visible:ring-1 focus-visible:ring-[#5865f2] focus-visible:ring-offset-0"
          />

          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </label>
            <Smile className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
