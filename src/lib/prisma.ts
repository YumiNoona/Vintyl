import "dotenv/config";
import { PrismaClient } from "@/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

// Use ws module for WebSocket in Node.js server
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  console.log(
    "🔗 DATABASE_URL:",
    url ? `${url.substring(0, 30)}...` : "MISSING!"
  );

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set! Check your .env file."
    );
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

let _client: PrismaClient | undefined;

export const client = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!_client) {
      _client = globalForPrisma.prisma ?? createPrismaClient();
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = _client;
      }
    }
    return (_client as any)[prop];
  },
});
