
import { NextResponse, type MiddlewareConfig, type NextRequest } from "next/server";

const publicRoutes = [
    { path: '/login', whenAuthenticated: 'redirect' },
    { path: '/registro', whenAuthenticated: 'redirect' },
    
];

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = '/login';


export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const publicRoute = publicRoutes.find(route => route.path === path);

    const authToken = request.cookies.get('token');

    if (!authToken && publicRoute) {
        // Usuário não autenticado acessando rota pública
        return NextResponse.next();
    }

    if (!authToken && !publicRoute) {
        // Usuário não autenticado acessando rota privada
        const redirectUrl = request.nextUrl.clone();

        redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
   
        return NextResponse.redirect(redirectUrl);
    }

    if (authToken && publicRoute && publicRoute.whenAuthenticated === 'redirect') {
        // Usuário autenticado acessando rota pública que deve redirecionar
        const redirectUrl = request.nextUrl.clone();

        redirectUrl.pathname = '/';

        return NextResponse.redirect(redirectUrl);
    }

    if (authToken && !publicRoute) {

        // Usuário autenticado acessando rota privada

        // Checar se o JWT está expirado
        // Se sim, remover o cooki e redirecionar o usuario par o login
        
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config: MiddlewareConfig = {
    matcher: [
        /*
        * - Ignorar os seguintes caminhos:
        * - api (API routes)
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        * - sitemap.xml (sitemap file)
        * - robots.txt (robots file)
        */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ]
};