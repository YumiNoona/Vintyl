import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signToken } from "@/lib/db/auth";

export default async function DesktopAuthPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect("/auth");
  }

  const user = session.user;
  const token = signToken({ userId: user.id, email: user.email, supabaseId: user.id });

  return redirect(`vintyl://auth?token=${token}&userId=${user.id}`);
}
