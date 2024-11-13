import { t } from "../trpc-router";
import { adminRouter } from "./admin";
import { ticketRouter } from "./ticket";
import { userRouter } from "./user";

export const appRouter = t.router({
	user: userRouter,
	admin: adminRouter,
	ticket: ticketRouter,
});

export type AppRouter = typeof appRouter;
