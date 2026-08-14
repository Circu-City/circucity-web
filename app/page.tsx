

import { Hero } from "@/components/home/Hero";
import { ImpactStats } from "@/components/home/ImpactStats";
import { SwapMarketPromo } from "@/components/home/SwapMarketPromo";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { PromoBanners } from "@/components/home/PromoBanners";
import { Categories } from "@/components/home/Categories";
import { Testimonials } from "@/components/home/Testimonials";
import { CTA } from "@/components/home/CTA";
import { Partner } from "@/components/home/Partner";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const revalidate = 60;

export default async function Home() {
    const { userId } = await auth();
    let isSeller = false;
    if (userId) {
        const shop = await prisma.shop.findUnique({ where: { ownerId: userId }, select: { id: true } });
        isSeller = !!shop;
    }

    return (
        <>
            <Hero />
            <ImpactStats />
            <SwapMarketPromo />
            <FeaturedProducts />
            <PromoBanners />
            <Categories />
            <Testimonials />
            {!isSeller && <Partner />}
            <CTA />
        </>
    );
}
