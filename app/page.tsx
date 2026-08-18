import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { AboutPreview } from "@/components/home/AboutPreview";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <AboutPreview />
      <NewsletterSection />
    </>
  );
}
