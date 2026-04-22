import { createServerClient, parseCookieHeader } from '@supabase/ssr';

export const onRequest: PagesFunction<{
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}> = async ({ request, next, env }) => {
  const url = new URL(request.url);

  // Allow access to login page and auth callback
  if (
    url.pathname === '/portal' || 
    url.pathname === '/portal/' || 
    url.pathname.startsWith('/portal/auth/')
  ) {
    return next();
  }

  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '');
      },
      setAll() {
        // Not used in middleware check
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return Response.redirect(`${url.origin}/portal`, 302);
  }

  return next();
};
