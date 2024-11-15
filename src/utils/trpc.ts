import type { AppRouter } from "@/app/api/trpc/routers";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
