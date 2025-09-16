import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

export default function AccordionBoxDemo() {
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
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="border border-b-0 last:border-b first:rounded-t-md last:rounded-b-md px-4"
        >
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionContent>{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
