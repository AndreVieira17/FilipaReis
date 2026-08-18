import { Hero } from "@/components/home/Hero";
import { ProductRails } from "@/components/home/ProductRails";
import { AboutPreview } from "@/components/home/AboutPreview";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function Home() {
  return (
    <>
      <Hero />
      <ProductRails />
      <AboutPreview />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}
