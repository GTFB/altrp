import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Contrast, Palette, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AccordionMediaContentDemo() {
  const t = useTranslations('demo.accordion.items');

  const itemKeys = ['accessible', 'styled', 'animated'] as const;
  const icons = [Contrast, Palette, Zap];
  const colors = ['blue', 'green', 'purple'];
  
  const items = itemKeys.map((key, index) => ({
    title: t(`${key}.title`),
    content: t(`${key}.content`),
    icon: icons[index],
    image: `https://placehold.co/1000x400/${colors[index]}/white?font=inter&text=${key}`
  }));
  return (
    <Accordion
      defaultValue="item-0"
      type="single"
      collapsible
      className="w-full"
    >
      {items.map(({ title, content, icon: Icon, image }, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger>
            <div className="flex items-start gap-3">
              <Icon />
              {title}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {content}
            <div className="mt-4 w-full aspect-18/9 rounded-xl overflow-hidden">
              <img 
                src={image} 
                alt={`${title} Media Content`} 
                className="w-full h-full object-cover"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
