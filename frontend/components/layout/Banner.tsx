"use client";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import Link from 'next/link'; // Import para navegação
import 'swiper/css';
import 'swiper/css/pagination';
import { getImageUrl } from "@/services/api";

export default function Banner({ banners }: { banners: any[] }) {
    if (!banners || banners.length === 0) return null;

    return (
        <section className="w-full px-4 mt-6">
            <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop={true}
                // REMOVIDO: h-[250px] e md:h-[450px] para deixar a imagem definir a altura
                className="container mx-auto rounded-[2rem] overflow-hidden shadow-2xl shadow-brand-blue/10"
            >
                {banners.map((banner) => {
                    // Prepara as URLs das imagens
                    const desktopImgUrl = getImageUrl(banner.image);
                    // Se não tiver imagem mobile cadastrada, usa a de desktop como fallback
                    const mobileImgUrl = banner.image_mobile ? getImageUrl(banner.image_mobile) : desktopImgUrl;

                    return (
                        <SwiperSlide key={banner.id}>
                            <div className="relative w-full overflow-hidden">
                                {/* Se tiver link, envolve a imagem. Se não, é só uma div. */}
                                {banner.link ? (
                                    <Link href={banner.link} target="_blank" className="block w-full h-full cursor-pointer">
                                        <BannerPicture 
                                            mobileSrc={mobileImgUrl} 
                                            desktopSrc={desktopImgUrl} 
                                            alt={banner.title} 
                                        />
                                    </Link>
                                ) : (
                                    <BannerPicture 
                                        mobileSrc={mobileImgUrl} 
                                        desktopSrc={desktopImgUrl} 
                                        alt={banner.title} 
                                    />
                                )}
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            {/* Estilo personalizado para os pontinhos da paginação ficarem bonitos */}
            <style jsx global>{`
                .swiper-pagination-bullet {
                    background: white !important;
                    opacity: 0.5;
                    width: 8px;
                    height: 8px;
                    transition: all 0.3s ease;
                }
                .swiper-pagination-bullet-active {
                    opacity: 1;
                    width: 24px;
                    border-radius: 4px;
                    background: #00AEEF !important; /* Cor Brand Blue */
                }
            `}</style>
        </section>
    );
}

// Subcomponente para organizar a tag <picture>
function BannerPicture({ mobileSrc, desktopSrc, alt }: { mobileSrc: string, desktopSrc: string, alt: string }) {
    return (
        <picture className="block w-full h-full">
            {/* 1. Se a tela for menor que 768px (Celular), carrega a imagem MOBILE */}
            <source 
                media="(max-width: 768px)" 
                srcSet={mobileSrc} 
            />
            
            {/* 2. Caso contrário (Desktop), carrega a imagem PADRÃO */}
            <img
                src={desktopSrc}
                alt={alt}
                className="w-full h-auto object-cover" // h-auto é vital aqui!
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/logo-oficial.png";
                }}
            />
        </picture>
    );
}