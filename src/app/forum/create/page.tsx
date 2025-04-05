"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import TextEditor from "@/components/TextEditor";
import Image from "next/image";

// import { getSignedURL } from "./action";
import { getSignedURL } from "@/actions/s3Actions";

import { api } from "@/trpc/react";

const CreateForum = () => {
  const router = useRouter();
  return (
    <section className="container mx-auto flex flex-col gap-6 px-6 py-6">
      <header className="flex flex-row items-center justify-start gap-2">
        <CircleChevronLeft onClick={() => router.back()} />
        <h2>Create Forum</h2>
      </header>
      <ForumForm />
    </section>
  );
};

export default CreateForum;

function ForumForm() {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate, isError } = api.forum.create.useMutation({
    onSuccess: () => {
      router.back();
    },
    onError: (error) => {
      console.error("Error creating forum:", error);
    },
  });

  // Update schema to properly handle File object
  const formSchema = z.object({
    title: z.string().nonempty("Title is required"),
    description: z.array(z.any()).nonempty("Description is required"),
    image: z.any().optional(), // Using any for the File object
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: [{ text: "" }],
      image: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      let imageUrl = "";

      if (values.image && values.image instanceof File) {
        const file = values.image;
        const fileName = `${file.name}`; // Add timestamp to prevent name collisions

        const signedURLResult = await getSignedURL(
          fileName,
          file.type,
          "forum-images",
        );

        if (signedURLResult.failure !== undefined) {
          console.error("Failed to get signed URL:", signedURLResult.failure);
          setIsSubmitting(false);
          return;
        }

        const { url } = signedURLResult.success!;

        if (!url) {
          throw new Error("Failed to get a valid URL");
        }

        // Upload the file to S3
        const uploadResponse = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload: ${uploadResponse.statusText}`);
        }

        // Set the public URL of the uploaded image
        imageUrl = (url as string).split("?")[0] || "testUrl"; // Extract the base URL without query parameters
      }

      // Prepare the final form data with the image URL
      const forumData = {
        title: values.title,
        description: values.description,
        imageUrl: imageUrl || undefined,
      };

      // Call the TRPC mutation
      mutate(forumData);

      if (isError) {
        console.error("Error creating forum:", isError);
      }
    } catch (error) {
      console.error("Error creating forum:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Set the actual File object to the form
      form.setValue("image", file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col items-start gap-4"
      >
        <FormField
          name="title"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Forum Title"
                  className="w-full border-gray-500 text-lg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <TextEditor value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="image"
          render={() => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input
                  id="picture"
                  type="file"
                  className="border-gray-500"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {previewUrl && (
          <div className="mt-4">
            <Image
              src={previewUrl}
              alt="Image Preview"
              width={300}
              height={200}
              className="h-auto max-w-full rounded"
            />
          </div>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-4"
          onClick={() => {
            // console.log("Clicked");
            // onSubmit(form.getValues());
          }}
        >
          {isSubmitting ? "Creating..." : "Post Forum"}
        </Button>
      </form>
    </Form>
  );
}
