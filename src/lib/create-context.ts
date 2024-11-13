import { SessionData, verifySession } from "@/lib/session";
import { headers } from "next/headers";

export interface ContextType {
  session: SessionData | null;
}

export async function createContext(): Promise<ContextType> {
  const token = (await headers()).get("authorization");

  const session = token ? verifySession(token.replace("Bearer ", "")) : null;

  console.log("Session", session);

  return {
    session,
  };
}
