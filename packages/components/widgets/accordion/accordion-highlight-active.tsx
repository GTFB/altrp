import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

export default function AccordionHighlightActiveItemDemo() {
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
    <Accordion
      defaultValue="item-0"
      type="single"
      collapsible
      className="w-full"
    >
      {items.map(({ title, content }, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="data-[state=open]:border-b-2 data-[state=open]:border-primary"
        >
          <AccordionTrigger className="data-[state=open]:text-primary">
            {title}
          </AccordionTrigger>
          <AccordionContent>{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
