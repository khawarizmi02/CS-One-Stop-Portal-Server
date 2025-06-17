import { postRouter } from "@/server/api/routers/post";
import { forumRouter } from "./routers/forums";
import { announcementRouter } from "./routers/annnouncement";
import { groupRouter } from "./routers/group";
import { taskRouter } from "./routers/task";
import { messageRouter } from "./routers/message";
import { userRouter } from "./routers/user";
import { mailRouter } from "./routers/mail";
import { searchRouter } from "./routers/search";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { adminRouter } from "./routers/admin";
import { calendarRouter } from "./routers/calendar";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  forum: forumRouter,
  announcement: announcementRouter,
  group: groupRouter,
  user: userRouter,
  task: taskRouter,
  message: messageRouter,
  mail: mailRouter,
  calendar: calendarRouter,
  search: searchRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
