import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // 1. Redirecionar /admin para /painel (para o usuário não ficar perdido)
    // Nota: Se você acessar /admin e o Nginx mandar para o Django, esse redirect nem acontece (o que é bom).
    // Se o Nginx mandar para o Next, ele joga para o novo painel.
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/')) {
         return NextResponse.redirect(new URL('/painel/login', request.url));
    }

    // 2. Se logado tentar ir pro login -> manda pra dashboard
    if (pathname === '/painel/login' && token) {
        return NextResponse.redirect(new URL('/painel/dashboard', request.url));
    }

    // 3. Proteger rotas do painel
    if (pathname.startsWith('/painel') && pathname !== '/painel/login' && !token) {
        return NextResponse.redirect(new URL('/painel/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Atualizado para observar /painel
    matcher: ['/painel/:path*', '/admin/:path*'],
};