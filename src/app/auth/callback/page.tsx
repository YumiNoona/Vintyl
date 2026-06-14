import { redirect } from "next/navigation";

export default async function AuthCallbackPage() {
  redirect("/dashboard");
}
