"use client";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { API_BASE_URL } from "@/services/api"; // Importação

export default function Banner({ banners }: { banners: any[] }) {
    if (!banners || banners.length === 0) return null;

    const getImageUrl = (path: string) => {
        if (!path) return "/placeholder.png";
        if (path.startsWith("http")) return path;
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const imagePath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${imagePath}`;
    };

    return (
        <section className="w-full px-4 mt-6">
            <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 5000 }}
                pagination={{ clickable: true }}
                className="container mx-auto rounded-[2rem] overflow-hidden shadow-2xl h-[250px] md:h-[450px]"
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                        <div className="relative w-full overflow-hidden rounded-[2.5rem]">
                            <img
                                src={getImageUrl(banner.image)}
                                alt={banner.title}
                                className="w-full h-auto min-h-[150px] md:h-[400px] object-cover object-center"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}