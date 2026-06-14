"use server";

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(state: any, formData: FormData) {
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (err: any) {
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
          full_name: fullName || "",
          firstName: firstName || "",
          lastName: lastName || "",
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (!data.user) {
      return { error: "User creation failed" }
    }

    if (!data.session) {
      return { success: true, emailConfirmationRequired: true }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred during signup." }
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
