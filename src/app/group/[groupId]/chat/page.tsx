"use client";
import React, { useState, useEffect, useRef } from "react";
import { MessageCircleMore } from "lucide-react";
import { api } from "@/trpc/react";
import { type User } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type MessageEvent = {
  id: string;
  content: string;
  createdAt: Date;
  groupId: string;
  createdById: string;
  createdBy: User;
};

const ChatRoom = () => {
  const { groupId } = useParams();
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageEvent[]>([]);
  const [input, setInput] = useState("");

  const id = Array.isArray(groupId) ? groupId[0] : groupId;
  if (!id) throw new Error("Id is not exist!");

  // Fetch initial messages
  const { data: initialMessages, refetch } = api.message.getMessages.useQuery({
    groupId: id,
  });

  const { mutate: sendMessage } = api.message.sendMessage.useMutation({
    onSuccess: () => {
      refetch();
      setInput("");
    },
    onError: (err) => {
      toast({
        title: "Uh oh! message cannot be send",
        description: `${err.message}. Please try again later.`,
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (input.trim()) {
      sendMessage({ groupId: id, content: input });
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

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="mb-8 flex items-start gap-2 border-b border-gray-500 pb-4">
        <MessageCircleMore />
        <h3>Chat Room</h3>
      </div>
      <ScrollArea className="h-[400px] w-full rounded-md border p-4">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <span className="font-bold">
              {msg.createdBy.firstName} {msg.createdBy.lastName ?? ""}:{" "}
            </span>
            {msg.content}
          </div>
        ))}
      </ScrollArea>
      <div className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
};

export default ChatRoom;
