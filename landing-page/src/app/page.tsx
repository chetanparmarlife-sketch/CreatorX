import Navbar from "@/components/Navbar";
import HeroSplit from "@/components/HeroSplit";
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
    <main className="min-h-screen bg-black text-white selection:bg-pink-500/30 selection:text-pink-200">
      <Navbar />
      <HeroSplit />
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
