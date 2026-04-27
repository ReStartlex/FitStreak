import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { CommunityCounter } from "@/components/landing/CommunityCounter";
import { Features } from "@/components/landing/Features";
import { ChallengesShowcase } from "@/components/landing/ChallengesShowcase";
import { ProgressShowcase } from "@/components/landing/ProgressShowcase";
import { SocialShowcase } from "@/components/landing/SocialShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { CtaBanner } from "@/components/landing/CtaBanner";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CommunityCounter />
        <Features />
        <ChallengesShowcase />
        <ProgressShowcase />
        <SocialShowcase />
        <HowItWorks />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
