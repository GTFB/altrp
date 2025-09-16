import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

export default function AccordionDemo() {
  const t = useTranslations('demo.accordion.items');

  const items = [
    {
      title: t('accessible.title'),
      content: t('accessible.content'),
    },
    {
      title: t('styled.title'),
      content: t('styled.content'),
    },
    {
      title: t('animated.title'),
      content: t('animated.content'),
    },
  ];

  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map(({ title, content }, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionContent>{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
