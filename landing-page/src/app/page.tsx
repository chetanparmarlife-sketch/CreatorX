import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ValueProps from "@/components/ValueProps";
import BrandMarquee from "@/components/BrandMarquee";
import WhyCreatorX from "@/components/WhyCreatorX";
import Platform from "@/components/Platform";
import CreatorShowcase from "@/components/CreatorShowcase";
import HowItWorks from "@/components/HowItWorks";
import Comparison from "@/components/Comparison";
import ContactForm from "@/components/ContactForm";
import Press from "@/components/Press";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      <ValueProps />
      <BrandMarquee />
      <WhyCreatorX />
      <Platform />
      <CreatorShowcase />
      <HowItWorks />
      <Comparison />
      <ContactForm />
      <Press />
      <Newsletter />
      <Footer />
    </main>
  );
}
