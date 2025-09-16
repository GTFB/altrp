import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Contrast, Palette, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AccordionIconDemo() {
  const t = useTranslations('demo.accordion.items');

  const items = [
    {
      title: t('accessible.title'),
      content: t('accessible.content'),
      icon: Contrast,
    },
    {
      title: t('styled.title'),
      content: t('styled.content'),
      icon: Palette,
    },
    {
      title: t('animated.title'),
      content: t('animated.content'),
      icon: Zap,
    },
  ];

  return (
    <Accordion
      defaultValue="item-0"
      type="single"
      collapsible
      className="w-full"
    >
      {items.map(({ title, content, icon: Icon }, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger>
            <div className="flex items-start gap-3">
              <Icon />
              {title}
            </div>
          </AccordionTrigger>
          <AccordionContent>{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
