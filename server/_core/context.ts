import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Client, User } from "../../drizzle/schema";
import { verifyClientSession, getClientTokenFromRequest, type ClientSessionPayload } from "./clientAuth";
import { sdk } from "./sdk";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  clientSession: ClientSessionPayload | null;
  client: Client | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let clientSession: ClientSessionPayload | null = null;
  let client: Client | null = null;

  // Admin session
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    user = null;
  }

  // Client portal session
  const clientToken = getClientTokenFromRequest(opts.req);
  if (clientToken) {
    clientSession = await verifyClientSession(clientToken);
    if (clientSession) {
      client = await db.getClientById(clientSession.clientId).catch(() => null);
    }
  }

  return { req: opts.req, res: opts.res, user, clientSession, client };
}
