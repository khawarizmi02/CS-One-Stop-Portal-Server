"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/trpc/react";

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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { DefaultImage } from "@/constant";
import { JSONValue } from "node_modules/superjson/dist/types";
import { JsonValue } from "@prisma/client/runtime/library";

const Announcement = () => {
  const router = useRouter();
  const { data, isLoading } = api.announcement.getALl.useQuery();
  return (
    <div className="container mx-auto px-6 py-6">
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

      <section className="grid grid-cols-2 gap-2">
        {data?.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </section>
    </div>
  );
};

export default Announcement;

const AnnouncementCard = ({ announcement }: AnnouncementCardProps) => {
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
          <DialogTitle>{announcement.title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <TextEditor
            value={announcement.content}
            onChange={() => {}}
            readOnly={true}
          />
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface AnnouncementCardProps {
  announcement: {
    id: string;
    title: string;
    content: JsonValue;
    createdBy: {
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
    };
  };
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
