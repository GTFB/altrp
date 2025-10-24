import { Container } from '@/components/Container';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    testimonial: 'Lorem aute irure dolor in reprehenderit in volupt velit esse cillum dolore eu fugiat nulla pariatur. Sed do eiusmod tempor incididunt ut labore.',
    authorName: 'Sienna Hewitt',
    authorTitle: 'Frontend Developer',
    authorAvatar: 'https://images.pexels.com/photos/1520760/pexels-photo-1520760.jpeg?auto=compress&cs=tinysrgb&w=128',
  },
  {
    id: 2,
    testimonial: 'Lorem aute irure dolor in reprehenderit in volupt velit esse cillum dolore eu fugiat nulla pariatur. Sed do eiusmod tempor incididunt ut labore.',
    authorName: 'Ashwin Santiago',
    authorTitle: 'Product Designer',
    authorAvatar: 'https://images.pexels.com/photos/7562139/pexels-photo-7562139.jpeg?auto=compress&cs=tinysrgb&w=128',
  },
  {
    id: 3,
    testimonial: 'Lorem aute irure dolor in reprehenderit in volupt velit esse cillum dolore eu fugiat nulla pariatur. Sed do eiusmod tempor incididunt ut labore.',
    authorName: 'Natali Craig',
    authorTitle: 'Software Engineer',
    authorAvatar: 'https://images.pexels.com/photos/698532/pexels-photo-698532.jpeg?auto=compress&cs=tinysrgb&w=128',
  },
];

export default function Testimonial_01() {
  return (
    <section className="py-16 lg:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center [&>p]:mx-auto [&>p]:max-w-xl">
          <h2 className="text-4xl/tight font-bold tracking-tight font-heading">What Users Say</h2>
          <p className="text-muted-foreground mt-4 text-lg/8">Sed eu quam id quam tristique pharetra a at tortor veil dsadsa. Suspendisse lorem odio sit amet libero facilisis.</p>
        </div>

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-3">
          {testimonials.map((testimonial) => {
            return (
              <div key={testimonial.id} className="bg-muted/50 rounded-2xl">
                <div className="p-8">
                  <div className="inline-flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-3 flex-1 text-sm/6">{testimonial.testimonial}</p>
                  <div className="[&>div>p:nth-child(2)]:text-muted-foreground mt-6 inline-flex w-auto gap-4 text-left [&>div]:text-sm/5.5 [&>div>p:first-child]:font-medium [&>img]:size-10 [&>img]:rounded-full [&>img]:object-cover">
                    <img src={testimonial.authorAvatar} alt={testimonial.authorName} />
                    <div>
                      <p>{testimonial.authorName}</p>
                      <p className="text-muted-foreground">{testimonial.authorTitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
