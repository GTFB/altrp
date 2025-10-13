
import { Container } from "@/components/misc/layout/Container";
import Hero01 from "@/components/blocks-app/Hero01";

export default function Home() {
  return (
      <div className="flex-1">
        <Container className="py-8">
          <Hero01 />
        </Container>
      </div>
  );
}
