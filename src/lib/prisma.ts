import { PrismaClient } from "@/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is missing")

  const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } })
  const adapter = new PrismaPg(pool as any)
  const prisma = new PrismaClient({ adapter, log: ["error"] })

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
  }

  return prisma
}

export const client = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getClient() as any)[prop]
  },
})