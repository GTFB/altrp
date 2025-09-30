import Navbar01Page from "@/components/home/navbar-01/navbar-01";
import Hero from "@/components/home/hero"; 
import FeaturesPage from "@/components/home/features";
import Features2Page from "@/components/home/features2";
import Stats from "@/components/home/stats";
import Features01Page from "@/components/home/fetaures";
import Stats01Page from "@/components/home/stats2";
import CtaPage from "@/components/home/cta";
import Footer from "@/components/home/footer";
import { Container } from "@/components/home/layout/Container";
import { ResourceOptimizer } from "@/components/ui/resource-optimizer";
import { CriticalCSS } from "@/components/ui/critical-css";

export default function Home() {
  return (
    <>
      <CriticalCSS />
      <ResourceOptimizer />
      <Navbar01Page />
      <div className="flex-1">
        <Container className="py-8">
        <Hero />
        <div className="mt-0 lg:mt-16"/>
        <FeaturesPage />
        <div className="mt-0 lg:mt-16"/>
        <Features2Page />
        <div className="mt-0 lg:mt-16"/>
        <Stats />
        <div className="mt-0 lg:mt-16"/>
        <Features01Page />
        <div className="mt-0 lg:mt-16"/>
        <Stats01Page />
        <div className="mt-10"/>
        <CtaPage />
        <div className="mt-0 lg:mt-16"/>
        </Container>
      </div>
      <Footer />
    </>
  );
}
