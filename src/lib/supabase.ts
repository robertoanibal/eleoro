import { createServerClient, type CookieOptions } from '@supabase/ssr';

export function createSupabaseClient(context: { cookies: any }) {
  return createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(key: string) {
          return context.cookies.get(key)?.value;
        },
        set(key: string, value: string, options: CookieOptions) {
          context.cookies.set(key, value, options);
        },
        remove(key: string, options: CookieOptions) {
          context.cookies.delete(key, options);
        },
      },
    }
  );
}
