import { onAuthenticatedUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage() {
  console.log("🔄 AUTH CALLBACK PAGE HIT");

  const auth = await onAuthenticatedUser();

  console.log("📋 AUTH RESULT:", auth.status);

  if (auth.status === 200 || auth.status === 201) {
    const workspaceId = auth.user?.workspace?.[0]?.id;
    console.log("📁 WORKSPACE ID:", workspaceId);

    if (workspaceId) {
      return redirect(`/dashboard/${workspaceId}`);
    }
  }

  // Fallback — don't loop back to callback, go to sign-in
  console.log("⚠️ Auth failed, redirecting to sign-in. Status:", auth.status);
  return redirect("/auth/sign-in");
}
