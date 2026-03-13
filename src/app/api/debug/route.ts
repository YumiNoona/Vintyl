import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { client } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await currentUser()

    const dbCheck = await client.$queryRaw`SELECT 1`

    return NextResponse.json({
      clerkUser: user
        ? {
            id: user.id,
            email: user.emailAddresses?.[0]?.emailAddress,
          }
        : null,
      database: dbCheck ? "connected" : "unknown",
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? "present" : "missing",
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message || "unknown error",
      },
      { status: 500 }
    )
  }
}
