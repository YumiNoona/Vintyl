-- =====================================================================
-- REPAIR SCRIPT: handle_new_user Trigger
-- This script ensures the registration trigger is robust and has 
-- proper permissions to create your user record.
-- =====================================================================

-- 1. Drop existing trigger and function to ensure a clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Re-create the function with SECURITY DEFINER
-- This is CRITICAL so the trigger can bypass RLS when creating the user.
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
  -- Log start for debugging (check Supabase logs if it fails)
  RAISE NOTICE '🚀 handle_new_user started for email %', NEW.email;

  -- Upsert User row
  INSERT INTO "User" ("supabaseId", email, "firstName", "lastName")
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'first_name', ''), 
      NULLIF(NEW.raw_user_meta_data->>'firstName', ''),
      ''
    ),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'last_name', ''), 
      NULLIF(NEW.raw_user_meta_data->>'lastName', ''),
      ''
    )
  )
  ON CONFLICT ("supabaseId") DO UPDATE
    SET
      email       = EXCLUDED.email,
      "firstName" = CASE
                      WHEN EXCLUDED."firstName" != '' THEN EXCLUDED."firstName"
                      ELSE "User"."firstName"
                    END,
      "lastName"  = CASE
                      WHEN EXCLUDED."lastName" != '' THEN EXCLUDED."lastName"
                      ELSE "User"."lastName"
                    END
  RETURNING id INTO v_uid;

  -- Ensure Subscription exists
  INSERT INTO "Subscription" ("userId", plan)
  VALUES (v_uid, 'FREE')
  ON CONFLICT ("userId") DO NOTHING;

  -- Create Personal Workspace if missing
  INSERT INTO "Workspace" ("userId", name, type)
  SELECT v_uid, 'Personal Workspace', 'PERSONAL'
  WHERE NOT EXISTS (
    SELECT 1 FROM "Workspace"
    WHERE "userId" = v_uid AND type = 'PERSONAL'
  )
  RETURNING id INTO v_wid;

  IF v_wid IS NULL THEN
    SELECT id INTO v_wid
    FROM "Workspace"
    WHERE "userId" = v_uid AND type = 'PERSONAL'
    LIMIT 1;
  END IF;

  -- Add owner as member
  INSERT INTO "Member" ("userId", "workspaceId", "supabaseId")
  VALUES (v_uid, v_wid, NEW.id)
  ON CONFLICT ("workspaceId", "supabaseId") DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '❌ handle_new_user failed: %', SQLERRM;
  RETURN NEW; -- Return NEW anyway to allow Auth creation, sync happens in app
END;
$$;

-- 3. Re-attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- DONE
