import TopNav from "@/components/TopNav";
import Hero from "@/components/Hero";
import SaaSKiller from "@/components/SaaSKiller";
import WhitepapersTeaser from "@/components/WhitepapersTeaser";
import WhoWeAre from "@/components/WhoWeAre";
import HowWeWork from "@/components/HowWeWork";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";



export default function Home() {
  return (
    <>
      <TopNav />
      <main>
        <Hero />
        <SaaSKiller />
        <WhitepapersTeaser />
        <WhoWeAre />
        <HowWeWork />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
