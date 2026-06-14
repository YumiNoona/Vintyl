import { getAuthUser, signIn, signUp, signOut } from '@/lib/db/auth';
import { LocalQuery } from '@/lib/db/client';
import { getDb } from '@/lib/db';

export async function createClient() {
  const user = await getAuthUser();
  return {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      getSession: async () => {
        if (!user) return { data: { session: null }, error: null };
        return {
          data: {
            session: {
              access_token: '',
              user: {
                id: user.supabaseId,
                email: user.email,
                user_metadata: { first_name: user.firstName, last_name: user.lastName, firstName: user.firstName, lastName: user.lastName },
              },
            },
          },
          error: null,
        };
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const result = await signIn(email, password);
        if (result.error) return { data: { user: null }, error: { message: result.error } };
        return { data: { user: result.data?.user || null }, error: null };
      },
      signUp: async ({ email, password, options }: { email: string; password: string; options?: { data?: any } }) => {
        const meta = options?.data || {};
        const result = await signUp(email, password, meta.firstName || meta.first_name || '', meta.lastName || meta.last_name || '');
        if (result.error) return { data: { user: null, session: null }, error: { message: result.error } };
        return {
          data: {
            user: result.data?.user || null,
            session: { access_token: '', user: result.data?.user || null },
          },
          error: null,
        };
      },
      signOut: async () => { await signOut(); return { error: null }; },
      updateUser: async (data: any) => {
        const currentUser = await getAuthUser();
        if (!currentUser) return { data: { user: null }, error: new Error('Not authenticated') };
        const db = getDb();
        const updates: any = {};
        if (data?.data?.first_name) updates.firstName = data.data.first_name;
        if (data?.data?.last_name) updates.lastName = data.data.last_name;
        if (data?.data?.avatar_url) updates.image = data.data.avatar_url;
        if (data?.email) updates.email = data.email;
        if (Object.keys(updates).length > 0) {
          const setClauses = Object.keys(updates).map(k => `"${k}" = ?`).join(', ');
          const vals = Object.values(updates);
          vals.push(currentUser.id);
          db.prepare(`UPDATE "User" SET ${setClauses} WHERE id = ?`).run(...vals);
        }
        return { data: { user: { ...currentUser, ...updates } }, error: null };
      },
    },
    from: (table: string) => new LocalQuery(table),
  };
}

export async function createSystemClient() {
  return createClient();
}
