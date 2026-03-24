-- =========================
-- 🔥 FULL RESET
-- =========================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

DROP TRIGGER IF EXISTS on_video_changes ON "Video";
DROP FUNCTION IF EXISTS public.update_video_count;

DROP TABLE IF EXISTS "Comment" CASCADE;
DROP TABLE IF EXISTS "Invite" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Video" CASCADE;
DROP TABLE IF EXISTS "Folder" CASCADE;
DROP TABLE IF EXISTS "Member" CASCADE;
DROP TABLE IF EXISTS "Subscription" CASCADE;
DROP TABLE IF EXISTS "Workspace" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

DROP TYPE IF EXISTS "Plan";

-- =========================
-- ENUM
-- =========================

CREATE TYPE "Plan" AS ENUM ('FREE','STANDARD','PRO','TEAM','ENTERPRISE');

-- =========================
-- TABLES
-- =========================

CREATE TABLE "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "supabaseId" UUID UNIQUE,
  email TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  image TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "Workspace" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'PERSONAL',
  "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
  "videoCount" INT DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX unique_personal_workspace
ON "Workspace" ("userId") WHERE type = 'PERSONAL';

CREATE TABLE "Member" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
  "workspaceId" UUID REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "supabaseId" UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE ("workspaceId","supabaseId")
);

CREATE TABLE "Folder" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT 'Untitled',
  "workspaceId" UUID REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "userId" UUID REFERENCES "User"(id) ON DELETE SET NULL,
  "videoCount" INT DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "Video" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT DEFAULT 'Untitled',
  description TEXT,
  source TEXT NOT NULL,
  processing BOOLEAN DEFAULT true,
  views INT DEFAULT 0,
  "isPublic" BOOLEAN DEFAULT false,
  "workspaceId" UUID NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "folderId" UUID REFERENCES "Folder"(id) ON DELETE SET NULL,
  "userId" UUID REFERENCES "User"(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "Subscription" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan "Plan" DEFAULT 'FREE',
  "userId" UUID UNIQUE REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE "Invite" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspaceId" UUID REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "receiverSupabaseId" UUID REFERENCES auth.users(id),
  email TEXT,
  accepted BOOLEAN DEFAULT false
);

CREATE TABLE "Comment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment TEXT NOT NULL,
  "videoId" UUID REFERENCES "Video"(id) ON DELETE CASCADE,
  "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE
);

-- =========================
-- USER PROVISIONING
-- =========================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE uid UUID;
DECLARE wid UUID;
BEGIN

  INSERT INTO "User" ("supabaseId", email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT ("supabaseId") DO UPDATE SET email = EXCLUDED.email
  RETURNING id INTO uid;

  INSERT INTO "Workspace" ("userId", name, type)
  SELECT uid, 'Personal Workspace', 'PERSONAL'
  WHERE NOT EXISTS (
    SELECT 1 FROM "Workspace"
    WHERE "userId" = uid AND type = 'PERSONAL'
  )
  RETURNING id INTO wid;

  IF wid IS NULL THEN
    SELECT id INTO wid FROM "Workspace"
    WHERE "userId" = uid AND type = 'PERSONAL' LIMIT 1;
  END IF;

  INSERT INTO "Member" ("userId","workspaceId","supabaseId")
  VALUES (uid,wid,NEW.id)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- VIDEO COUNT TRIGGER
-- =========================

CREATE OR REPLACE FUNCTION public.update_video_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE "Workspace" SET "videoCount" = "videoCount"+1 WHERE id=NEW."workspaceId";
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE "Workspace" SET "videoCount" = GREATEST("videoCount"-1,0) WHERE id=OLD."workspaceId";
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_video_changes
AFTER INSERT OR DELETE ON "Video"
FOR EACH ROW EXECUTE FUNCTION public.update_video_count();

-- =========================
-- INDEXES
-- =========================

CREATE INDEX ON "Member" ("workspaceId","supabaseId");
CREATE INDEX ON "Video" ("workspaceId");
CREATE INDEX ON "Folder" ("workspaceId");

-- =========================
-- RLS
-- =========================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Folder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Video" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;

-- USER
CREATE POLICY "user_self"
ON "User"
FOR ALL
USING ("supabaseId" = auth.uid());

-- WORKSPACE
CREATE POLICY "workspace_access"
ON "Workspace"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Member"
    WHERE "workspaceId"="Workspace".id
    AND "supabaseId"=auth.uid()
  )
);

-- MEMBER (FIXED)
CREATE POLICY "member_access"
ON "Member"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Member" m
    WHERE m."workspaceId"="Member"."workspaceId"
    AND m."supabaseId"=auth.uid()
  )
);

-- FOLDER
CREATE POLICY "folder_access"
ON "Folder"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Member"
    WHERE "workspaceId"="Folder"."workspaceId"
    AND "supabaseId"=auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Member"
    WHERE "workspaceId"="Folder"."workspaceId"
    AND "supabaseId"=auth.uid()
  )
);

-- VIDEO
CREATE POLICY "video_access"
ON "Video"
FOR ALL
USING (
  "isPublic"=true OR EXISTS (
    SELECT 1 FROM "Member"
    WHERE "workspaceId"="Video"."workspaceId"
    AND "supabaseId"=auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Member"
    WHERE "workspaceId"="Video"."workspaceId"
    AND "supabaseId"=auth.uid()
  )
);

-- INVITE
CREATE POLICY "invite_access"
ON "Invite"
FOR ALL
USING ("receiverSupabaseId"=auth.uid());

-- COMMENT (FIXED)
CREATE POLICY "comment_access"
ON "Comment"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Video" v
    JOIN "Member" m ON m."workspaceId" = v."workspaceId"
    WHERE v.id = "Comment"."videoId"
    AND m."supabaseId" = auth.uid()
  )
)
WITH CHECK (auth.uid() IS NOT NULL);