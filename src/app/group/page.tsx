"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/trpc/react";
import { type Group as GroupType } from "@prisma/client";

import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageCircle, Router, Search, Users, X, Check } from "lucide-react";
import AuthButton from "@/components/AuthButton";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { UseMutateFunction } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Group = () => {
  const router = useRouter();
  const { toast } = useToast();

  const {
    data: groups,
    isLoading,
    refetch: refetchGroupList,
  } = api.group.getAllByUser.useQuery();
  const { mutate, isPending } = api.group.create.useMutation({
    onSuccess: () => {
      toast({ title: "Group successfully created!" });
      router.push("/group");
      refetchGroupList();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Uh oh! Group cannot be created",
      });
    },
  });

  return (
    <div className="container mx-auto h-full px-6 py-6">
      <div className="mb-8 flex items-start justify-between border-b border-gray-500 pb-4">
        <h2>Groups</h2>

        <Dialog>
          <DialogTrigger asChild>
            <AuthButton roles={["student", "lecturer"]}>
              Create Group
            </AuthButton>
          </DialogTrigger>
          <CreateGroupDialog mutate={mutate} isPending={isPending} />
        </Dialog>
      </div>

      <GroupList groups={groups || []} isLoading={isLoading} />
    </div>
  );
};

export default Group;

interface GroupListProps {
  groups: GroupType[];
  isLoading: boolean;
}

const GroupList = ({ groups, isLoading }: GroupListProps) => {
  const router = useRouter();

  if (isLoading)
    return (
      <section className="flex h-full w-full flex-col items-center justify-center">
        <Loading />
      </section>
    );

  if (!groups || groups.length === 0) {
    return (
      <section className="flex h-full w-full flex-col items-center justify-center gap-4 py-12 text-slate-500">
        <div className="rounded-full bg-slate-100 p-6">
          <Users className="h-10 w-10 text-slate-400" />
        </div>
        <p className="text-lg font-medium">No groups found</p>
        <p>Create a new group to get started</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search groups..."
              className="pl-10"
              type="search"
            />
          </div>
          <Select defaultValue="newest">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name">Group name</SelectItem>
              <SelectItem value="members">Member count</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-slate-500">{groups.length} groups</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card
            key={group.id}
            onClick={() => router.push(`/group/${group.id}/chat`)}
            className="hover:ring-primary/20 overflow-hidden transition-all duration-200 hover:shadow-md hover:ring-2"
          >
            <div className="from-primary/10 to-secondary/10 flex h-24 items-center justify-center bg-linear-to-r">
              <div className="text-primary flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-semibold shadow-sm">
                {group.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <Badge variant="outline" className="ml-2 whitespace-nowrap">
                  {Array.isArray(group.members) ? group.members.length : 0}{" "}
                  members
                </Badge>
              </div>

              {group.description && (
                <CardDescription className="mt-2 line-clamp-2">
                  {group.description}
                </CardDescription>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {Array.isArray(group.members) &&
                    group.members.slice(0, 3).map((member, i) => (
                      <Avatar key={i} className="h-8 w-8 ring-2 ring-white">
                        <AvatarImage
                          src={
                            typeof member === "object" &&
                            member &&
                            "imageUrl" in member
                              ? String(member.imageUrl || "")
                              : undefined
                          }
                          alt={
                            typeof member === "object" &&
                            member &&
                            "firstName" in member
                              ? String(member.firstName || "Member")
                              : "Member"
                          }
                        />
                        <AvatarFallback>
                          {typeof member === "object" &&
                          member &&
                          "firstName" in member &&
                          typeof member.firstName === "string"
                            ? member.firstName.substring(0, 1)
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  {Array.isArray(group.members) && group.members.length > 3 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600 ring-2 ring-white">
                      +{group.members.length - 3}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const formSchema = z.object({
  name: z.string().nonempty("Group must have a name"),
  description: z.string().optional(),
  members: z.array(z.string()).min(1, "Please select at least one member"),
});

interface CreateGroupDialogProps {
  mutate: UseMutateFunction<
    {
      group: {
        name: string;
        id: string;
        description: string;
        imageUrl: string | null;
        members: unknown; // Adjust type if needed
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
      };
      groupMembers: unknown; // Adjust type if needed
    },
    unknown,
    {
      name: string;
      description?: string;
      members: string[];
    },
    unknown
  >;
  isPending: boolean;
}

const CreateGroupDialog = ({ mutate, isPending }: CreateGroupDialogProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: availableUsers, isLoading: loadingUsers } =
    api.user.getAll.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const { data: student, isLoading } = api.user.getStudent.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const formSchema = z.object({
    name: z.string().nonempty("Group must have a name"),
    description: z.string().optional(),
    members: z.array(z.string()).min(1, "Please select at least one member"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      members: [],
    },
  });

  const selectedMembers = form.watch("members");

  // Filter users based on search term
  const filteredUsers = student?.filter((user) =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleSelectMember = (userId: string) => {
    const currentMembers = form.getValues("members");
    if (currentMembers.includes(userId)) {
      form.setValue(
        "members",
        currentMembers.filter((id) => id !== userId),
        { shouldValidate: true },
      );
    } else {
      form.setValue("members", [...currentMembers, userId], {
        shouldValidate: true,
      });
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  if (isLoading || loadingUsers) {
    return <Loading size="sm" />;
  }

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Create Group</DialogTitle>
        <DialogDescription>
          Fill in the details and select members for your new group chat.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter group name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the purpose of this group"
                    {...field}
                    className="h-24 resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="members"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Group Members</FormLabel>
                <FormDescription>
                  Select the users you want to add to this group.
                </FormDescription>

                <div className="flex flex-col gap-4">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search for users..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Selected members badges */}
                  {selectedMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map((id) => {
                        const user = student?.find((user) => user.id === id);
                        return (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {user?.firstName || "User"}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => toggleSelectMember(id)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {/* User selection list */}
                  <ScrollArea className="h-64 rounded-md border">
                    {filteredUsers && filteredUsers.length > 0 ? (
                      <div className="flex flex-col">
                        {filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            className={`flex cursor-pointer items-center justify-between border-b p-3 hover:bg-gray-50 ${
                              selectedMembers.includes(user.id)
                                ? "bg-gray-50"
                                : ""
                            }`}
                            onClick={() => toggleSelectMember(user.id)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.imageUrl || ""} />
                                <AvatarFallback>
                                  {user.firstName?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {user.firstName || "User"}
                                </p>
                                {user.role && (
                                  <p className="text-xs text-gray-500">
                                    {user.role}
                                  </p>
                                )}
                              </div>
                            </div>

                            {selectedMembers.includes(user.id) && (
                              <div className="bg-primary rounded-full p-1">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center p-4">
                        <p className="text-gray-500">No users found</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending || selectedMembers.length === 0}
            >
              {isPending ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};
