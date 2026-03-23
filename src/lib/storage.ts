import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = "vintyl-videos";

/**
 * Generate a public URL for a stored video
 */
export async function getVideoUrl(key: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

/**
 * Upload a video buffer/file to Supabase Storage
 */
export async function uploadVideo(key: string, body: Buffer | File, contentType: string) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(key, body, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error("Supabase Upload Error:", error);
    throw error;
  }

  return data;
}
