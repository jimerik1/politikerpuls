import { postRouter } from "~/server/api/routers/post";
import { politicianRouter } from "./routers/politicianRouter";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { partyRouter } from "./routers/partyRouter";
import { biographyRouter } from "./routers/biographyRouter";
import { governmentRouter } from "./routers/governmentRouter";
import { caseRouter } from "./routers/caseRouter";
import { topicRouter } from "./routers/topicRouter";
import { documentRouter } from "./routers/documentationRouter";
import { userRouter } from "./routers/userRouter";


/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  politician: politicianRouter,
  party: partyRouter,
  biography: biographyRouter,
  government: governmentRouter,
  case: caseRouter,
  topic: topicRouter,
  document: documentRouter,
  user: userRouter
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
