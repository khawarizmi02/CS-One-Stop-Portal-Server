"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api, type RouterOutputs } from "@/trpc/react";

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
import { Button } from "@/components/ui/button";
import TextEditor from "@/components/TextEditor";
import AuthButton from "@/components/AuthButton";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { DefaultImage } from "@/constant";
import { JsonValue } from "@prisma/client/runtime/library";
import { type Announcement } from "@prisma/client";
import { Search, X, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AvatarFallback } from "@/components/ui/avatar";

const Announcement = () => {
  const router = useRouter();
  const { data, isLoading } = api.announcement.getALl.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto min-h-screen bg-gray-50 px-6 py-6">
        <div className="mb-8 flex items-start justify-between border-b border-gray-500 pb-4">
          <h2>Announcements</h2>
          <Dialog>
            <DialogTrigger asChild>
              <AuthButton roles={["admin", "lecturer"]}>
                Create Announcement
              </AuthButton>
            </DialogTrigger>
            <CreateAnnouncementForm />
          </Dialog>
        </div>
        <p className="text-center text-gray-500">Loading announcements...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="container mx-auto min-h-screen bg-gray-50 px-6 py-6">
        <div className="mb-8 flex items-start justify-between border-b border-gray-500 pb-4">
          <h2>Announcements</h2>
          <Dialog>
            <DialogTrigger asChild>
              <AuthButton roles={["admin", "lecturer"]}>
                Create Announcement
              </AuthButton>
            </DialogTrigger>
            <CreateAnnouncementForm />
          </Dialog>
        </div>
        <p className="text-center text-gray-500">
          No announcements yet. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen bg-gray-50 px-6 py-6">
      <div className="mb-8 flex items-start justify-between border-b border-gray-500 pb-4">
        <h2>Announcements</h2>
        <Dialog>
          <DialogTrigger asChild>
            <AuthButton roles={["admin", "lecturer"]}>
              Create Announcement
            </AuthButton>
          </DialogTrigger>
          <CreateAnnouncementForm />
        </Dialog>
      </div>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </section>
    </div>
  );
};

export default Announcement;

const AnnouncementCard = ({ announcement }: AnnouncementCardProps) => {
  const formattedDate = announcement.createdAt
    ? new Date(announcement.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown date";

  return (
    <Dialog>
      <DialogTrigger>
        <Card className="flex flex-row items-center justify-start gap-3 p-3">
          <Avatar className="h-[60px] w-[60px]">
            <AvatarImage
              src={announcement.createdBy?.imageUrl ?? DefaultImage.src}
              alt={`user-${announcement.createdBy.firstName}-${announcement.createdBy.lastName}`}
            />
          </Avatar>
          <CardTitle className="line-clamp-1">{announcement.title}</CardTitle>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            {announcement.title}
          </DialogTitle>
          <div className="mt-2 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={announcement.createdBy?.imageUrl ?? DefaultImage.src}
                alt={`user-${announcement.createdBy.firstName}-${announcement.createdBy.lastName}`}
              />
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {announcement.createdBy.firstName}{" "}
                {announcement.createdBy.lastName}
              </p>
              <p className="text-xs text-gray-500">{formattedDate}</p>
            </div>
          </div>
        </DialogHeader>
        <hr className="my-4 border-gray-200" />
        <DialogDescription className="max-h-[60vh] overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            <TextEditor
              value={announcement.content}
              onChange={() => {}}
              readOnly={true}
            />
          </div>
        </DialogDescription>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface AnnouncementCardProps {
  announcement: RouterOutputs["announcement"]["getALl"][number];
}

const CreateAnnouncementForm = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const { mutate, isPending } = api.announcement.create.useMutation({
    onError: (error) => {
      console.log("Error creating announcement", error);
      toast({
        title: "Uh oh! Something went wrong.",
        description: "Please contact the admin",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Announcement has been created",
      });
      form.reset();
    },
  });

  const { data: availableUsers, isLoading: loadingUsers } =
    api.user.getAll.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const formSchema = z.object({
    title: z.string().nonempty("Title is required"),
    content: z.array(z.any()).nonempty("Content is required"),
    targetUsers: z.array(z.string()).min(1, "Please select at least one user"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: [{ text: "" }],
      targetUsers: [],
    },
  });

  const selectedUsers = form.watch("targetUsers");

  const toggleSelectUser = (userId: string) => {
    const currentUsers = form.getValues("targetUsers");
    if (currentUsers.includes(userId)) {
      form.setValue(
        "targetUsers",
        currentUsers.filter((id) => id !== userId),
        { shouldValidate: true },
      );
    } else {
      form.setValue("targetUsers", [...currentUsers, userId], {
        shouldValidate: true,
      });
    }
  };

  const filteredUsers = availableUsers?.filter((user) =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      mutate({
        ...values,
        targetUser: values.targetUsers,
      });
    } catch (error) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: "Please contact the admin",
        variant: "destructive",
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Create Announcement</DialogTitle>
        <DialogDescription>
          Fill in the details and select target users for your new announcement.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Announcement Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <TextEditor value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetUsers"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Target Users</FormLabel>
                <FormDescription>
                  Select the users who will receive this announcement.
                </FormDescription>
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search for users..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map((id) => {
                        const user = availableUsers?.find(
                          (user) => user.id === id,
                        );
                        return (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {user?.firstName || "User"} {user?.lastName || ""}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => toggleSelectUser(id)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <ScrollArea className="h-64 rounded-md border">
                    {loadingUsers ? (
                      <div className="flex h-full items-center justify-center p-4">
                        <p className="text-gray-500">Loading users...</p>
                      </div>
                    ) : filteredUsers && filteredUsers.length > 0 ? (
                      <div className="flex flex-col">
                        {filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            className={`flex cursor-pointer items-center justify-between border-b p-3 hover:bg-gray-50 ${
                              selectedUsers.includes(user.id)
                                ? "bg-gray-50"
                                : ""
                            }`}
                            onClick={() => toggleSelectUser(user.id)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.imageUrl || ""} />
                                <AvatarFallback>
                                  {user.firstName?.[0] || "U"}{" "}
                                  {user.lastName || ""}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {user.firstName || "User"}{" "}
                                  {user.lastName || ""}
                                </p>
                                {user.role && (
                                  <p className="text-xs text-gray-500">
                                    {user.role}
                                  </p>
                                )}
                              </div>
                            </div>
                            {selectedUsers.includes(user.id) && (
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
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending || selectedUsers.length === 0}
            >
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};
