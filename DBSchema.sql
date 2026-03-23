-- Vintyl Supabase Schema (Direct Postgres SQL)

-- 1. Create a Public User table that syncs with Auth
CREATE TABLE "public"."User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clerkId" TEXT, -- Keep this for migration reference if needed
    "supabaseId" UUID UNIQUE,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

-- 2. Subscription Plan Enum
CREATE TYPE "public"."Plan" AS ENUM ('FREE', 'STANDARD', 'PRO', 'TEAM', 'ENTERPRISE');

-- 3. Workspace Table
CREATE TABLE "public"."Workspace" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PERSONAL', -- PERSONAL/PUBLIC
    "userId" UUID NOT NULL REFERENCES "public"."User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

-- 4. Folder Table
CREATE TABLE "public"."Folder" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL DEFAULT 'Untitled',
    "workspaceId" UUID NOT NULL REFERENCES "public"."Workspace"("id") ON DELETE CASCADE,
    "userId" UUID REFERENCES "public"."User"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

-- 5. Video Table
CREATE TABLE "public"."Video" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT DEFAULT 'Untitled',
    "description" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "processing" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "transcript" TEXT,
    "resolution" TEXT DEFAULT '720p',
    "duration" INTEGER DEFAULT 0,
    "folderId" UUID REFERENCES "public"."Folder"("id") ON DELETE SET NULL,
    "workspaceId" UUID NOT NULL REFERENCES "public"."Workspace"("id") ON DELETE CASCADE,
    "userId" UUID REFERENCES "public"."User"("id") ON DELETE SET NULL,
    PRIMARY KEY ("id")
);

-- 6. Subscription Table
CREATE TABLE "public"."Subscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan" "public"."Plan" NOT NULL DEFAULT 'FREE',
    "customerId" TEXT UNIQUE,
    "userId" UUID NOT NULL UNIQUE REFERENCES "public"."User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

-- 7. Notification Table
CREATE TABLE "public"."Notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "userId" UUID NOT NULL REFERENCES "public"."User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Enable RLS on all tables
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Video" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Subscription" ENABLE ROW LEVEL SECURITY;

-- Add a Trigger to automatically create a User record when someone signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."User" (supabaseId, email, "firstName", "lastName", image)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: User needs to run this in Supabase SQL Editor:
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
