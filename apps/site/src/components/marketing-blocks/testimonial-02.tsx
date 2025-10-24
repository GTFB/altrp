import { Container } from '@/components/Container';
import { Star } from 'lucide-react';

export default function Testimonial_02() {
  return (
    <section className="py-16 lg:py-32">
      <Container>
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex gap-2 sm:gap-3 [&>svg]:size-4 [&>svg]:fill-amber-400 [&>svg]:text-amber-400 sm:[&>svg]:size-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} />
            ))}
          </div>
          <h2 className="mt-4 text-lg/7 font-medium tracking-tight sm:text-2xl/snug lg:text-3xl/snug">Blookie has revolutionized my workflow. The amazing design blocks are a game changer for building my projects.</h2>
          <div className="[&>div>p:nth-child(2)]:text-muted-foreground mt-8 inline-flex w-auto gap-4 text-left [&>div]:text-sm/5.5 [&>div>p:first-child]:font-medium [&>img]:size-10 [&>img]:rounded-full [&>img]:object-cover">
            <img src="https://images.pexels.com/photos/7562139/pexels-photo-7562139.jpeg?auto=compress&cs=tinysrgb&w=128" alt="" />
            <div>
              <p>Ashwin Santiago</p>
              <p>Web Developer</p>
            </div>
          </div>
        </div>
      </div>
      </Container>
    </section>
  );
}
