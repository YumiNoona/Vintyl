import { uploadVideo as localUpload, getVideoUrl as localGetUrl, deleteVideo as localDelete } from './storage-local';

export const getStorageClient = () => {
  return {
    storage: {
      from: (_bucket: string) => ({
        upload: async (key: string, body: Buffer | File, opts?: { contentType?: string; upsert?: boolean }) => {
          try {
            await localUpload(key, body, opts?.contentType || 'application/octet-stream');
            return { data: { path: key }, error: null };
          } catch (err: any) {
            return { data: null, error: err };
          }
        },
        getPublicUrl: (key: string) => {
          return { data: { publicUrl: localGetUrl(key) } };
        },
        remove: async (keys: string[]) => {
          try {
            keys.forEach(k => localDelete(k));
            return { data: null, error: null };
          } catch (err: any) {
            return { data: null, error: err };
          }
        },
        createSignedUploadUrl: async (key: string) => {
          return { data: { signedUrl: `/api/video/${encodeURIComponent(key)}` }, error: null };
        },
      }),
    },
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    from: () => ({
      select: () => ({ data: null, error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
  };
};

export async function getVideoUrl(key: string) {
  return localGetUrl(key);
}

export async function uploadVideo(key: string, body: Buffer | File, contentType: string) {
  return localUpload(key, body, contentType);
}
