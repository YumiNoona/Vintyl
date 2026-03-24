import { createClient } from "@supabase/supabase-js";

/**
 * Lazy-initialize the Supabase client for storage operations
 */
export const getStorageClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase Storage credentials missing in environment variables");
  }

  return createClient(url, key);
};

const BUCKET = "vintyl-videos";

/**
 * Generate a public URL for a stored video
 */
export async function getVideoUrl(key: string) {
  const supabase = getStorageClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

/**
 * Upload a video buffer/file to Supabase Storage
 */
export async function uploadVideo(key: string, body: Buffer | File, contentType: string) {
  const supabase = getStorageClient();
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
