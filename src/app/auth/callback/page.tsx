import { createClient } from "@/lib/supabase/server";
import { onAuthenticatedUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>;
}) {
  const { code, next = "/dashboard" } = await searchParams;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("❌ CALLBACK ERROR:", error.message);
      return redirect("/auth?error=" + encodeURIComponent(error.message));
    }
  }

  const auth = await onAuthenticatedUser();

  if (auth.status === 200 || auth.status === 201) {
    const workspaceId = auth.user?.workspace?.[0]?.id;
    if (workspaceId) {
      return redirect(`/dashboard/${workspaceId}`);
    }
    return redirect("/dashboard");
  }

  console.log("⚠️ Auth failed, redirecting to sign-in. Status:", auth.status);
  return redirect("/auth");
}
