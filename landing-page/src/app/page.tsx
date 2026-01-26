import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BrandMarquee from "@/components/BrandMarquee";
import ValueProps from "@/components/ValueProps";
import WhyCreatorX from "@/components/WhyCreatorX";
import Platform from "@/components/Platform";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <BrandMarquee />
      <ValueProps />
      <WhyCreatorX />
      <Platform />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  );
}
