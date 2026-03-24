import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DesktopAuthPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect("/auth");
  }

  const token = session.access_token;
  const userId = session.user.id;

  // Redirect to Electron deep link
  return redirect(`vintyl://auth?token=${token}&userId=${userId}`);
}
