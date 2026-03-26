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
      console.error("❌ Auth callback error:", error.message);
      return redirect("/auth?error=" + encodeURIComponent(error.message));
    }
  }

  const auth = await onAuthenticatedUser();

  if (auth.status === 200 || auth.status === 201) {
    const workspaceId = auth.user?.workspace?.[0]?.id;
    return redirect(workspaceId ? `/dashboard/${workspaceId}` : "/dashboard");
  }

  return redirect("/auth");
}
