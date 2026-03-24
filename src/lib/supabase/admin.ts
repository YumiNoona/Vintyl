import { createClient } from "@supabase/supabase-js";

export const getSupabaseAdmin = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error("Supabase Admin credentials missing in environment variables");
    }

    return createClient(url, key);
};
