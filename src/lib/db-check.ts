import { client } from "./prisma"

export async function checkDatabase() {
  try {
    await client.$queryRaw`SELECT 1`
    console.log("✅ Database connected")
  } catch (err) {
    console.error("❌ Database connection failed", err)
  }
}
