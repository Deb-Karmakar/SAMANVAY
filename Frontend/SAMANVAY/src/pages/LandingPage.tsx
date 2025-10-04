import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemStatement from "@/components/ProblemStatement";
import ThreePillars from "@/components/ThreePillars";
import KeyFeatures from "@/components/KeyFeatures";
import Benefits from "@/components/Benefits";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <ProblemStatement />
        <ThreePillars />
        <KeyFeatures />
        <Benefits />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
