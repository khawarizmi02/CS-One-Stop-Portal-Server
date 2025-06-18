import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { authoriseAccountAccess } from "./mail";
import Account from "@/lib/account";

// Helper function to extract text from Slate content
export const extractSlateText = (content: any[]): string => {
  return content
    .map((node) => {
      if (node.children && Array.isArray(node.children)) {
        return node.children
          .map((child: any) => child.text || "")
          .filter((text: string) => text.trim().length > 0)
          .join(" ");
      }
      return "";
    })
    .filter((text: string) => text.trim().length > 0)
    .join("\n\n");
};

export const announcementRouter = createTRPCRouter({
  getALl: protectedProcedure.query(async ({ ctx }) => {
    const announcement = await ctx.db.announcement.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: true,
      },
    });

    if (!announcement) throw new Error("Failed to get announcements");

    return announcement;
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        content: z.array(z.any()).min(1, "Content is required"),
        targetUser: z
          .array(z.string())
          .min(1, "At least one target user is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.auth?.userId;

      if (!authorId) {
        throw new Error("Not authenticated");
      }

      const userExists = await ctx.db.user.findUnique({
        where: { id: authorId },
        select: { id: true, firstName: true, email: true },
      });

      if (!userExists || !userExists.email) {
        throw new Error("User or user email not found");
      }

      const userAccount = await ctx.db.account.findUnique({
        where: { userId: authorId },
        select: { id: true },
      });

      if (!userAccount || !userAccount) {
        throw new Error("User account or email not found");
      }

      const post = await ctx.db.announcement.create({
        data: {
          title: input.title,
          content: input.content,
          createdById: authorId,
          targetUsers: input.targetUser,
        },
      });

      const targetUsers = await ctx.db.user.findMany({
        where: {
          id: { in: input.targetUser },
          role: {
            not: "admin",
          },
        },
        select: {
          email: true,
          firstName: true,
        },
      });

      const targetEmails = targetUsers
        .map((user) => ({
          address: user.email,
          name: user.firstName || "Recipient",
        }))
        .filter(
          (email): email is { address: string; name: string } =>
            !!email.address,
        );

      if (targetEmails.length === 0) {
        console.warn("No valid target user emails found for notification");
        return post;
      }

      const emailBody = extractSlateText(input.content);

      try {
        const acc = await authoriseAccountAccess(userAccount.id, authorId);
        const account = new Account(acc.token);

        await account.sendEmail({
          from: {
            address: userExists.email,
            name: userExists.firstName || "Announcer",
          },
          subject: input.title,
          body: emailBody,
          to: targetEmails,
          threadId: undefined,
          replyTo: {
            address: userExists.email,
            name: userExists.firstName || "Announcer",
          },
          inReplyTo: undefined,
          references: undefined,
          cc: undefined,
          bcc: undefined,
        });

        console.log(
          "Email sent successfully to:",
          targetEmails.map((e) => e.address),
        );
      } catch (error) {
        console.error("Failed to send email notification:", error);
      }

      return post;
    }),
});
