// middleware.ts (ou proxy.ts se for middleware)
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = [
  { path: '/login', whenAuthenticated: 'redirect' },
  { path: '/registro', whenAuthenticated: 'redirect' },
];

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = '/login';

function decodePayloadFromToken(token?: string | null) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find(route => route.path === path);

  const access = request.cookies.get('access_token')?.value ?? null;
  const refresh = request.cookies.get('refresh_token')?.value ?? null;

  if (!access && publicRoute) {
    return NextResponse.next();
  }

  if (!access && !publicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }

  if (access && publicRoute && publicRoute.whenAuthenticated === 'redirect') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  if (access && !publicRoute) {
    const payload = decodePayloadFromToken(access);
    const exp = payload?.exp;
    const now = Math.floor(Date.now() / 1000);
    if (!exp || now >= exp) {
      // token expirado: limpar cookie e redirecionar para login
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
      const res = NextResponse.redirect(redirectUrl);
      // remover cookies (instrução para o browser)
      res.cookies.set('access_token', '', { path: '/', expires: new Date(0) });
      res.cookies.set('refresh_token', '', { path: '/', expires: new Date(0) });
      return res;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};

export default middleware;