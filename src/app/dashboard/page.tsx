import { onAuthenticatedUser } from "@/actions/user";
import { createWorkspace } from "@/actions/workspace";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const auth = await onAuthenticatedUser();

  if (auth.status === 200 || auth.status === 201) {
    if (auth.user?.workspace && auth.user.workspace.length > 0) {
      return redirect(`/dashboard/${auth.user.workspace[0].id}`);
    }

    // New User or No Workspace: Create a default one
    const newWorkspace = await createWorkspace(`${auth.user?.firstName || 'My'}'s Workspace`);
    if (newWorkspace.status === 201 && newWorkspace.data) {
      return redirect(`/dashboard/${newWorkspace.data}`);
    }
    
    console.error("❌ DashboardPage: Failed to create or find workspace. Status:", newWorkspace.status);
  }

  if (auth.status === 400 || auth.status === 404 || auth.status === 500) {
    console.log("⚠️ DashboardPage: Invalid auth status, redirecting to /auth. Status:", auth.status);
    return redirect("/auth");
  }

  return redirect("/auth");
}
