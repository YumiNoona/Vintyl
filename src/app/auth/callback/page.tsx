import { onAuthenticatedUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage() {
  const auth = await onAuthenticatedUser();

  if (auth.status === 200 || auth.status === 201) {
    // User exists or was just created — redirect to their workspace
    const workspaceId = auth.user?.workspace?.[0]?.id;
    if (workspaceId) {
      return redirect(`/dashboard/${workspaceId}`);
    }
  }

  // Fallback — send to sign-in
  return redirect("/auth/sign-in");
}
