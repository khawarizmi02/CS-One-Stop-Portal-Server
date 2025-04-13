"use client";
import React from "react";
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
  // Assuming announcement has a createdAt field for the timestamp
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
  const { mutate, isPending } = api.announcement.create.useMutation({
    onError: (error) => {
      console.log("Error creating announcement", error);
    },
    onSuccess: () => {
      toast({
        title: "Announcement has been created",
      });
      form.reset();
    },
  });

  const formSchema = z.object({
    title: z.string().nonempty(),
    content: z.array(z.any()).nonempty(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: [{ text: "" }],
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      mutate(values);
    } catch (error) {
      toast({
        title: "Uh oh! Something wrong out there.",
        description: "Please contact with the admin",
        variant: "destructive",
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Create Announcement</DialogTitle>
        <DialogDescription>
          Fill in the details to create a new announcement.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
          <DialogFooter>
            {isPending ? (
              <Button>Submiting...</Button>
            ) : (
              <Button type="submit">Submit</Button>
            )}
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};
