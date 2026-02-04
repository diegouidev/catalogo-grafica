// frontend/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // Se estiver no login e já tiver token, vai para a dashboard
    if (pathname === '/admin/login' && token) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Se tentar acessar qualquer página admin sem token, volta para o login
    if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !token) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};