import { LocalQuery } from '@/lib/db/client';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/db/auth';

export const getSupabaseAdmin = () => {
  return {
    auth: {
      getUser: async () => {
        const user = await getAuthUser();
        return { data: { user }, error: null };
      },
    },
    from: (table: string) => new LocalQuery(table),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: async () => ({ data: null, error: null }),
        createSignedUploadUrl: async () => ({ data: { signedUrl: '' }, error: null }),
      }),
    },
  };
};
