"use server";

import { createClient, createSystemClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(state: any, formData: FormData) {
  // ... (login remains same, but let's make sure it's correct)
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log("🔐 Attempting login for email:", email);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("❌ Login Error:", error.message);
      return { error: error.message }
    }

    console.log("✅ Login successful for:", email);
    return { success: true }
  } catch (err: any) {
    console.error("❌ Login Catch:", err);
    return { error: "An unexpected error occurred during login." }
  }
}

export async function signup(state: any, formData: FormData) {
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = (formData.get('full_name') as string || "").trim()

    const [firstName, ...rest] = fullName.split(" ")
    const lastName = rest.join(" ")

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || "",
          last_name: lastName || "",
        },
      },
    })

    if (error) {
       console.error("❌ Signup Auth Error:", error.message);
       return { error: error.message }
    }

    if (!data.user) {
        return { error: "User creation failed" }
    }

    // Since we have a robust DB trigger (handle_new_user), 
    // it will automatically create User, Subscription, and Personal Workspace records.
    // We can safely proceed without manual sync here unless immediate session is required.

    if (!data.session) {
      return { success: true, emailConfirmationRequired: true }
    }

    return { success: true }
  } catch (err: any) {
    console.error("❌ Signup Catch:", err);
    return { error: "An unexpected error occurred during signup." }
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
