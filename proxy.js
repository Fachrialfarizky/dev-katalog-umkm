import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Melindungi seluruh rute /admin (kecuali /admin/login) agar hanya bisa diakses admin yang login.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const adalahHalamanLogin =
    pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  let response = NextResponse.next({
    request,
  });

  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    if (adalahHalamanLogin) {
      return response;
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let user = null;

  try {
    const supabase = createServerClient(url, publishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (err) {
    console.error("Gagal memeriksa sesi admin di proxy:", err);
  }

  if (!user && !adalahHalamanLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
