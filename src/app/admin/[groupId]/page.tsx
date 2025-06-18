"use client";
import React from "react";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import Loading from "@/components/Loading";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const GroupInfo = () => {
  const params = useParams();
  const groupId = params.groupId as string;

  const { data: group, isLoading } = api.group.getByGroupId.useQuery({
    id: groupId,
  });

  if (isLoading) {
    return (
      <section className="flex h-full w-full flex-col items-center justify-center">
        <Loading />
      </section>
    );
  }

  if (!group) {
    return (
      <section className="flex h-full w-full flex-col items-center justify-center">
        <p className="text-gray-500">Group not found</p>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8 lg:p-10">
      <Form>
        <div className="mx-auto max-w-2xl space-y-6">
          <FormItem>
            <FormLabel>Group Name</FormLabel>
            <FormControl>
              <Input
                value={group.name || ""}
                disabled
                className="bg-gray-100"
              />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                value={group.description || ""}
                disabled
                className="h-24 resize-none bg-gray-100"
              />
            </FormControl>
          </FormItem>

          <FormItem className="flex flex-col">
            <FormLabel>Group Members</FormLabel>
            <FormDescription>List of users in this group.</FormDescription>

            <div className="flex flex-col gap-4">
              {/* Members badges */}
              {group.members && group.members.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {group.members.map((member) => (
                    <Badge
                      key={member.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {member.firstName || "User"}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No members in this group</p>
              )}

              {/* Members list */}
              <ScrollArea className="h-64 rounded-md border">
                {group.members && group.members.length > 0 ? (
                  <div className="flex flex-col">
                    {group.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between border-b bg-gray-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.imageUrl || ""} />
                            <AvatarFallback>
                              {member.firstName?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.firstName || "User"}
                            </p>
                            {member.role && (
                              <p className="text-xs text-gray-500">
                                {member.role}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center p-4">
                    <p className="text-gray-500">No members found</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </FormItem>

          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default GroupInfo;
