"use client";

import * as React from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Property } from "@/types";

type PropertyCarouselProps = {
    properties: Property[];
};

export function PropertyCarousel({ properties }: PropertyCarouselProps) {
    // データがない場合のフォールバック（デモ表示用）
    const displayProperties: Property[] = properties.length > 0 ? properties : [
        {
            id: "demo-bgc",
            createdAt: "",
            updatedAt: "",
            publishedAt: "",
            revisedAt: "",
            name: "THE SEASONS RESIDENCE - BGC",
            price: "6,800万円",
            price_local: "26,000,000 PHP",
            location: "Manila BGC",
            images: [{ url: "/luxury-apartment.png", height: 1080, width: 1920 }],
            description: "マニラの一等地に佇む、日本の四季をテーマにしたタワーレジデンス。",
            installment_48: true,
            infrastructure_dist: "地下鉄BGC駅から徒歩3分",
            status_badge: ["利回り特選", "TOD物件"],
        } as unknown as Property,
        {
            id: "demo-london",
            createdAt: "",
            updatedAt: "",
            publishedAt: "",
            revisedAt: "",
            name: "ONE HYDE PARK - LONDON",
            price: "2.5億円",
            price_local: "1,500,000 GBP",
            location: "London Knightsbridge",
            images: [{ url: "/luxury-apartment.png", height: 1080, width: 1920 }],
            description: "世界中の富裕層が注目する、ロンドン中心部のハイエンドレジデンス。",
            installment_48: false,
            infrastructure_dist: "ナイツブリッジ駅直結",
            status_badge: ["非公開", "資産性重視"],
        } as unknown as Property,
        {
            id: "demo-dubai",
            createdAt: "",
            updatedAt: "",
            publishedAt: "",
            revisedAt: "",
            name: "BURJ KHALIFA RESIDENCE",
            price: "1.2億円",
            price_local: "3,000,000 AED",
            location: "Dubai Downtown",
            images: [{ url: "/luxury-apartment.png", height: 1080, width: 1920 }],
            description: "世界一の高さを誇るタワーで暮らす、究極のステータス。",
            installment_48: true,
            infrastructure_dist: "ドバイモール直結",
            status_badge: ["先行募集", "税制優遇"],
        } as unknown as Property,
    ];

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                    {displayProperties.map((prop, index) => (
                        <CarouselItem key={prop.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                            <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-100 group h-full cursor-pointer relative">
                                {/* Image Area */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={prop.images?.[0]?.url || "/luxury-apartment.png"}
                                        alt={prop.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Location Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-primary/95 text-white text-xs font-bold px-3 py-1.5 tracking-wider uppercase shadow-md border border-primary-light">
                                            {prop.location}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 relative flex flex-col h-[280px]">
                                    {/* Badges from CMS data */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {prop.status_badge?.map((badge, i) => (
                                            <span key={i} className="text-[10px] font-bold text-accent border border-accent px-2 py-0.5 rounded-full bg-accent/5">
                                                {badge}
                                            </span>
                                        ))}
                                        {prop.installment_48 && (
                                            <span className="text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded-full shadow-sm">
                                                48回分割可
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-serif font-bold text-primary mb-2 line-clamp-1 group-hover:text-accent transition-colors">
                                        {prop.name}
                                    </h3>

                                    {/* インフラ情報 */}
                                    {prop.infrastructure_dist && (
                                        <div className="flex items-center text-xs text-gray-500 mb-3 font-medium">
                                            <span className="mr-1">📍</span> {prop.infrastructure_dist}
                                        </div>
                                    )}

                                    <p className="text-gray-600 text-sm font-serif line-clamp-2 mb-4 flex-grow">
                                        {prop.description}
                                    </p>

                                    {/* 価格情報 */}
                                    <div className="mt-auto border-t border-gray-100 pt-4">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <span className="text-xs text-muted block mb-0.5">参考価格 (JPY)</span>
                                                <span className="text-xl font-display font-bold text-primary">{prop.price_jpn || prop.price}</span>
                                            </div>
                                            {prop.price_local && (
                                                <div className="text-right">
                                                    <span className="text-xs text-muted block mb-0.5">現地価格</span>
                                                    <span className="text-sm font-medium text-gray-600">{prop.price_local}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 bg-white/80 hover:bg-white text-primary border-none shadow-md" />
                <CarouselNext className="right-2 bg-white/80 hover:bg-white text-primary border-none shadow-md" />
            </Carousel>
        </div>
    );
}
