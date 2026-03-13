import { onAuthenticatedUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function CallbackPage() {
  const auth = await onAuthenticatedUser();

  if (auth.status === 200 || auth.status === 201) {
    if (auth.user?.workspace && auth.user.workspace.length > 0) {
      return redirect(`/dashboard/${auth.user.workspace[0].id}`);
    }
  }

  return redirect("/auth/sign-in");
}
