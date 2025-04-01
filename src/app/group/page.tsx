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
import { Router, X } from "lucide-react";
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
      router.refresh();
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
    <div className="container mx-auto px-6 py-6">
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
      <section className="flex h-full w-full flex-col items-center justify-center text-slate-500">
        <p>No groups found</p>
      </section>
    );
  }

  return (
    <section className="mx-auto grid grid-cols-2 gap-2">
      {groups.map((group) => (
        <Card
          key={group.id}
          onClick={() => router.push(`/group/${group.id}/chat`)}
          className="flex cursor-pointer flex-row gap-4 overflow-hidden rounded-lg bg-white p-4 shadow hover:bg-gray-100"
        >
          <CardTitle>{group.name}</CardTitle>
          <CardDescription>
            No. of members:{" "}
            {Array.isArray(group.members) ? group.members.length : 0}
          </CardDescription>
        </Card>
      ))}
    </section>
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  if (isLoading || loadingUsers) {
    return <Loading size="sm" />;
  }

  return (
    <DialogContent className="max-h-[90%] overflow-y-scroll sm:max-w-[500px]">
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
                {availableUsers?.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="members"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {item.firstName}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};
