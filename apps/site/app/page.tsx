import { Container } from "@/components/home/layout/Container";
import Hero01 from "@/components/home/hero-01";
import Features04Page from "@/components/home/features-04";

export default function Home() {
  return (
    <>
      <div className="flex-1">
        <Container className="py-8">
          <Hero01 />
          <Features04Page />
        </Container>
      </div>
    </>
  );
}
