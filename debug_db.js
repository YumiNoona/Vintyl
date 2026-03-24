require("dotenv").config({ path: ".env" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
  const targetSupabaseId = 'd670e58c-bda4-4dba-bdd3-423dc8c055ce';
  const targetWorkspaceId = '2a1d86f3-4e66-4f00-bba4-2ba552bff97f';

  console.log("🔍 Checking User...");
  const { data: user } = await supabase.from("User").select("*").eq("supabaseId", targetSupabaseId).maybeSingle();
  console.log("User:", user);

  console.log("\n🔍 Checking Workspace...");
  const { data: workspaces } = await supabase.from("Workspace").select("*").eq("id", targetWorkspaceId);
  console.log("Workspaces found:", workspaces ? workspaces.length : 0);
  if (workspaces && workspaces.length > 0) {
    console.log("Workspace 0 owner userId:", workspaces[0].userId);
    console.log("Workspace 0 ID:", workspaces[0].id);
  }

  console.log("\n🔍 Checking All Members for this User...");
  const { data: members } = await supabase.from("Member").select("*").eq("supabaseId", targetSupabaseId);
  console.log("Members found for supabaseId:", members ? members.length : 0);
  console.log("Members:", members);

  console.log("\n🔍 Checking Specific Member for this Workspace...");
  const { data: specificMember } = await supabase
    .from("Member")
    .select("*")
    .eq("workspaceId", targetWorkspaceId)
    .eq("supabaseId", targetSupabaseId);
  console.log("Specific Member result count:", specificMember ? specificMember.length : 0);
  console.log("Specific Member result:", specificMember);
}

checkData();
