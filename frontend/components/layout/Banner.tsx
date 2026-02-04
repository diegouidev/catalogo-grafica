"use client";
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function Banner({ banners }: { banners: any[] }) {
    if (!banners || banners.length === 0) return null;

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
                                src={banner.image}
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