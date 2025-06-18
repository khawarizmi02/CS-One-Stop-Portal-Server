"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import Loading from "@/components/Loading";
import {
  MessageCircle,
  Router,
  Search,
  Users,
  X,
  Check,
  CircleChevronLeft,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const CreateUserGroup = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: availableUsers, isLoading: loadingUsers } =
    api.user.getAll.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const { data: student, isLoading } = api.user.getStudent.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = api.admin.createAppGroup.useMutation({
    onSuccess: () => {
      toast({
        title: "Group created successfully",
        description: "Your group has been created.",
        variant: "default",
      });
      router.push("/admin");
    },
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
  const filteredUsers = availableUsers?.filter((user) =>
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
    return (
      <section className="flex h-full w-full flex-col items-center justify-center">
        <Loading />
      </section>
    );
  }

  return (
    <section className="container mx-auto flex flex-col gap-6 px-6 py-6">
      <header className="flex flex-row items-center justify-start gap-2">
        <CircleChevronLeft onClick={() => router.back()} />
        <h2>Create New User Group</h2>
      </header>

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
                        const user = availableUsers?.find(
                          (user) => user.id === id,
                        );
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

          <Button variant="outline">Cancel</Button>
          <Button
            type="submit"
            disabled={isPending || selectedMembers.length === 0}
          >
            {isPending ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </Form>
    </section>
  );
};

export default CreateUserGroup;
