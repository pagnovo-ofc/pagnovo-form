import { ContextType } from "@/lib/create-context";
import { initTRPC, TRPCError } from "@trpc/server";
// import superjson from "superjson";

export const t = initTRPC.context<ContextType>().create({
	// transformer: superjson,
});

export const publicProcedure = t.procedure;

export const authenticatedProcedure = t.procedure.use((opts) => {
	const { ctx } = opts;

	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Unauthorized",
		});
	}

	return opts.next({
		ctx: {
			session: ctx.session,
		},
	});
});

export const adminProcedure = authenticatedProcedure.use((opts) => {
	const { ctx } = opts;

	if (ctx.session.role !== "ADMIN") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Forbidden",
		});
	}

	return opts.next({
		ctx,
	});
});
