-- =====================================================================
-- VINTYL — FINAL FULL RESET
-- Matches every column the application code actually uses.
-- Run this in Supabase SQL Editor. Safe to run multiple times.
-- =====================================================================


-- =====================================================================
-- SECTION 1: FULL TEARDOWN
-- =====================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_video_changes ON "Video";
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_video_count() CASCADE;

DROP TABLE IF EXISTS "Notification"  CASCADE;
DROP TABLE IF EXISTS "Comment"       CASCADE;
DROP TABLE IF EXISTS "Invite"        CASCADE;
DROP TABLE IF EXISTS "Video"         CASCADE;
DROP TABLE IF EXISTS "Folder"        CASCADE;
DROP TABLE IF EXISTS "Member"        CASCADE;
DROP TABLE IF EXISTS "Subscription"  CASCADE;
DROP TABLE IF EXISTS "Workspace"     CASCADE;
DROP TABLE IF EXISTS "User"          CASCADE;

DROP TYPE IF EXISTS "Plan" CASCADE;


-- =====================================================================
-- SECTION 2: ENUM
-- =====================================================================

CREATE TYPE "Plan" AS ENUM ('FREE', 'STANDARD', 'PRO', 'TEAM', 'ENTERPRISE');


-- =====================================================================
-- SECTION 3: TABLES
-- (Every column referenced anywhere in the codebase is included)
-- =====================================================================

CREATE TABLE "User" (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "supabaseId" UUID        UNIQUE,
  email        TEXT,
  "firstName"  TEXT        DEFAULT '',
  "lastName"   TEXT        DEFAULT '',
  image        TEXT        DEFAULT '',
  "createdAt"  TIMESTAMPTZ DEFAULT now(),
  "updatedAt"  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "Workspace" (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  type          TEXT        DEFAULT 'PERSONAL',
  "userId"      UUID        REFERENCES "User"(id) ON DELETE CASCADE,
  "videoCount"  INT         DEFAULT 0,
  "createdAt"   TIMESTAMPTZ DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX unique_personal_workspace
  ON "Workspace" ("userId") WHERE type = 'PERSONAL';

CREATE TABLE "Member" (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"      UUID REFERENCES "User"(id)      ON DELETE CASCADE,
  "workspaceId" UUID REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "supabaseId"  UUID REFERENCES auth.users(id)  ON DELETE CASCADE,
  "createdAt"   TIMESTAMPTZ DEFAULT now(),
  UNIQUE ("workspaceId", "supabaseId")
);

CREATE TABLE "Subscription" (
  id           UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
  plan         "Plan" DEFAULT 'FREE',
  "customerId" TEXT,
  "userId"     UUID   UNIQUE REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE "Folder" (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        DEFAULT 'Untitled',
  "workspaceId" UUID        REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "userId"      UUID        REFERENCES "User"(id)      ON DELETE SET NULL,
  "videoCount"  INT         DEFAULT 0,                  -- used by FolderProps type and sidebar
  "createdAt"   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "Video" (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        DEFAULT 'Untitled',
  description   TEXT,                                   -- used by editVideoInfo, VideoProps type
  source        TEXT        NOT NULL,
  processing    BOOLEAN     DEFAULT true,               -- used by getAllUserVideos filter, video preview
  views         INT         DEFAULT 0,                  -- used by incrementVideoViews, video preview
  "isPublic"    BOOLEAN     DEFAULT false,
  transcript    TEXT,
  summary       TEXT,
  "workspaceId" UUID        NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "folderId"    UUID        REFERENCES "Folder"(id)    ON DELETE SET NULL,  -- used by moveVideoLocation
  "userId"      UUID        REFERENCES "User"(id)      ON DELETE SET NULL,
  "createdAt"   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "Invite" (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspaceId"        UUID        REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "senderId"           UUID        REFERENCES "User"(id)      ON DELETE SET NULL,
  "receiverId"         UUID        REFERENCES "User"(id)      ON DELETE SET NULL,  -- used by inviteMembers
  "receiverSupabaseId" UUID        REFERENCES auth.users(id)  ON DELETE SET NULL,
  email                TEXT,
  content              TEXT,                             -- used by inviteMembers notification content
  accepted             BOOLEAN     DEFAULT false
);

CREATE TABLE "Comment" (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  comment     TEXT        NOT NULL,
  "commentId" UUID        REFERENCES "Comment"(id) ON DELETE SET NULL,  -- parent (threading)
  reply       BOOLEAN     DEFAULT false,                -- used by createComment, CommentProps type
  "videoId"   UUID        REFERENCES "Video"(id)   ON DELETE CASCADE,
  "userId"    UUID        REFERENCES "User"(id)    ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "Notification" (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID        REFERENCES "User"(id)   ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  "inviteId"  UUID        REFERENCES "Invite"(id) ON DELETE SET NULL,  -- used by activity page
  "createdAt" TIMESTAMPTZ DEFAULT now()
);


-- =====================================================================
-- SECTION 4: INDEXES
-- =====================================================================

CREATE INDEX ON "Member"       ("workspaceId", "supabaseId");
CREATE INDEX ON "Member"       ("supabaseId");
CREATE INDEX ON "Video"        ("workspaceId");
CREATE INDEX ON "Video"        ("userId");
CREATE INDEX ON "Folder"       ("workspaceId");
CREATE INDEX ON "Comment"      ("videoId");
CREATE INDEX ON "Notification" ("userId");
CREATE INDEX ON "Invite"       ("receiverSupabaseId");
CREATE INDEX ON "Invite"       ("senderId");


-- =====================================================================
-- SECTION 5: TRIGGERS
-- =====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_wid UUID;
BEGIN
  -- Upsert User — reads firstName/lastName from auth metadata
  INSERT INTO "User" ("supabaseId", email, "firstName", "lastName")
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'firstName',  ''),
      ''
    ),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'last_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'lastName',  ''),
      ''
    )
  )
  ON CONFLICT ("supabaseId") DO UPDATE
    SET
      email       = EXCLUDED.email,
      "firstName" = CASE WHEN EXCLUDED."firstName" != '' THEN EXCLUDED."firstName" ELSE "User"."firstName" END,
      "lastName"  = CASE WHEN EXCLUDED."lastName"  != '' THEN EXCLUDED."lastName"  ELSE "User"."lastName"  END
  RETURNING id INTO v_uid;

  -- Provision FREE Subscription
  INSERT INTO "Subscription" ("userId", plan)
  VALUES (v_uid, 'FREE')
  ON CONFLICT ("userId") DO NOTHING;

  -- Create Personal Workspace
  INSERT INTO "Workspace" ("userId", name, type)
  SELECT v_uid, 'Personal Workspace', 'PERSONAL'
  WHERE NOT EXISTS (
    SELECT 1 FROM "Workspace" WHERE "userId" = v_uid AND type = 'PERSONAL'
  )
  RETURNING id INTO v_wid;

  IF v_wid IS NULL THEN
    SELECT id INTO v_wid FROM "Workspace"
    WHERE "userId" = v_uid AND type = 'PERSONAL' LIMIT 1;
  END IF;

  -- Add owner as Member
  INSERT INTO "Member" ("userId", "workspaceId", "supabaseId")
  VALUES (v_uid, v_wid, NEW.id)
  ON CONFLICT ("workspaceId", "supabaseId") DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for %: %', NEW.email, SQLERRM;
  RETURN NEW; -- Always return NEW so auth signup still succeeds
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


CREATE OR REPLACE FUNCTION public.update_video_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE "Workspace" SET "videoCount" = "videoCount" + 1 WHERE id = NEW."workspaceId";
    IF NEW."folderId" IS NOT NULL THEN
      UPDATE "Folder" SET "videoCount" = "videoCount" + 1 WHERE id = NEW."folderId";
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE "Workspace" SET "videoCount" = GREATEST("videoCount" - 1, 0) WHERE id = OLD."workspaceId";
    IF OLD."folderId" IS NOT NULL THEN
      UPDATE "Folder" SET "videoCount" = GREATEST("videoCount" - 1, 0) WHERE id = OLD."folderId";
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_video_changes
  AFTER INSERT OR DELETE ON "Video"
  FOR EACH ROW EXECUTE FUNCTION public.update_video_count();


-- =====================================================================
-- SECTION 6: ROW LEVEL SECURITY
-- =====================================================================

ALTER TABLE "User"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Member"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Folder"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Video"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invite"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;


-- USER: own row only
CREATE POLICY "user_self" ON "User" FOR ALL
  USING ("supabaseId" = auth.uid());


-- MEMBER: direct column check — NO subquery into Member (causes infinite recursion)
-- All cross-member queries in server code use the service role key (bypasses RLS)
CREATE POLICY "member_self" ON "Member" FOR ALL
  USING  ("supabaseId" = auth.uid())
  WITH CHECK ("supabaseId" = auth.uid());


-- WORKSPACE: any member of the workspace can access it
CREATE POLICY "workspace_access" ON "Workspace" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Member"
      WHERE "Member"."workspaceId" = "Workspace".id
        AND "Member"."supabaseId"  = auth.uid()
    )
  );


-- SUBSCRIPTION: own subscription only
CREATE POLICY "subscription_self" ON "Subscription" FOR ALL
  USING (
    "userId" = (SELECT id FROM "User" WHERE "supabaseId" = auth.uid())
  );


-- FOLDER: workspace members only
CREATE POLICY "folder_access" ON "Folder" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Member"
      WHERE "Member"."workspaceId" = "Folder"."workspaceId"
        AND "Member"."supabaseId"  = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Member"
      WHERE "Member"."workspaceId" = "Folder"."workspaceId"
        AND "Member"."supabaseId"  = auth.uid()
    )
  );


-- VIDEO: public videos readable by all; private only by workspace members
CREATE POLICY "video_access" ON "Video" FOR ALL
  USING (
    "isPublic" = true
    OR EXISTS (
      SELECT 1 FROM "Member"
      WHERE "Member"."workspaceId" = "Video"."workspaceId"
        AND "Member"."supabaseId"  = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Member"
      WHERE "Member"."workspaceId" = "Video"."workspaceId"
        AND "Member"."supabaseId"  = auth.uid()
    )
  );


-- INVITE: receiver can accept; sender can see their sent invites
CREATE POLICY "invite_access" ON "Invite" FOR ALL
  USING (
    "receiverSupabaseId" = auth.uid()
    OR EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id           = "Invite"."senderId"
        AND "User"."supabaseId" = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id           = "Invite"."senderId"
        AND "User"."supabaseId" = auth.uid()
    )
  );


-- COMMENT: workspace members of the video's workspace
CREATE POLICY "comment_access" ON "Comment" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Video" v
      JOIN "Member" m ON m."workspaceId" = v."workspaceId"
      WHERE v.id             = "Comment"."videoId"
        AND m."supabaseId"   = auth.uid()
    )
  )
  WITH CHECK (
    "userId" = (SELECT id FROM "User" WHERE "supabaseId" = auth.uid())
  );


-- NOTIFICATION: own notifications only
CREATE POLICY "notification_self" ON "Notification" FOR ALL
  USING (
    "userId" = (SELECT id FROM "User" WHERE "supabaseId" = auth.uid())
  );


-- =====================================================================
-- SECTION 7: BOOTSTRAP YOUR EXISTING AUTH USER
-- Provisions the User/Subscription/Workspace/Member rows for any
-- auth.users accounts that existed before this reset.
-- =====================================================================

DO $$
DECLARE
  rec      RECORD;
  v_uid    UUID;
  v_wid    UUID;
BEGIN
  FOR rec IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP

    INSERT INTO "User" ("supabaseId", email, "firstName", "lastName")
    VALUES (
      rec.id,
      rec.email,
      COALESCE(NULLIF(rec.raw_user_meta_data->>'first_name', ''), NULLIF(rec.raw_user_meta_data->>'firstName', ''), ''),
      COALESCE(NULLIF(rec.raw_user_meta_data->>'last_name',  ''), NULLIF(rec.raw_user_meta_data->>'lastName',  ''), '')
    )
    ON CONFLICT ("supabaseId") DO UPDATE
      SET email = EXCLUDED.email
    RETURNING id INTO v_uid;

    INSERT INTO "Subscription" ("userId", plan)
    VALUES (v_uid, 'FREE')
    ON CONFLICT ("userId") DO NOTHING;

    INSERT INTO "Workspace" ("userId", name, type)
    SELECT v_uid, 'Personal Workspace', 'PERSONAL'
    WHERE NOT EXISTS (
      SELECT 1 FROM "Workspace" WHERE "userId" = v_uid AND type = 'PERSONAL'
    )
    RETURNING id INTO v_wid;

    IF v_wid IS NULL THEN
      SELECT id INTO v_wid FROM "Workspace"
      WHERE "userId" = v_uid AND type = 'PERSONAL' LIMIT 1;
    END IF;

    INSERT INTO "Member" ("userId", "workspaceId", "supabaseId")
    VALUES (v_uid, v_wid, rec.id)
    ON CONFLICT ("workspaceId", "supabaseId") DO NOTHING;

    RAISE NOTICE 'Bootstrapped: % → User % / Workspace %', rec.email, v_uid, v_wid;
  END LOOP;
END;
$$;

-- =====================================================================
-- DONE — After running this, add .env.local to your project root
-- with the correct NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
-- then sign in again.
-- =====================================================================