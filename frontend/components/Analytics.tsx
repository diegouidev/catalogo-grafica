"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getCompanyConfig } from "@/services/api";

export default function Analytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const initPixels = async () => {
            const config = await getCompanyConfig();
            if (!config) return;

            // 1. Injetar Facebook Pixel
            if (config.facebook_pixel_id) {
                // Verifica se já existe para não duplicar
                if (!document.getElementById('fb-pixel-script')) {
                    const script = document.createElement('script');
                    script.id = 'fb-pixel-script';
                    script.innerHTML = `
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '${config.facebook_pixel_id}');
                        fbq('track', 'PageView');
                    `;
                    document.head.appendChild(script);
                }
            }

            // 2. Injetar Google Analytics (GA4)
            if (config.google_analytics_id) {
                if (!document.getElementById('google-analytics-script')) {
                    // Script 1 (src)
                    const script1 = document.createElement('script');
                    script1.async = true;
                    script1.src = `https://www.googletagmanager.com/gtag/js?id=${config.google_analytics_id}`;
                    document.head.appendChild(script1);

                    // Script 2 (config)
                    const script2 = document.createElement('script');
                    script2.id = 'google-analytics-script';
                    script2.innerHTML = `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${config.google_analytics_id}');
                    `;
                    document.head.appendChild(script2);
                }
            }
        };

        initPixels();
    }, []);

    // Rastrear PageView quando a rota mudar (para SPAs como Next.js)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Monta a URL completa (slug + parâmetros de busca, se houver)
            const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

            // 1. Dispara o PageView do Facebook
            if ((window as any).fbq) {
                (window as any).fbq('track', 'PageView');
            }

            // 2. Dispara o PageView do Google Analytics
            if ((window as any).gtag) {
                (window as any).gtag('event', 'page_view', {
                    page_path: url,
                    page_location: window.location.href,
                    page_title: document.title,
                });
            }
        }
    }, [pathname, searchParams]);

    return null; // Componente visualmente vazio
}