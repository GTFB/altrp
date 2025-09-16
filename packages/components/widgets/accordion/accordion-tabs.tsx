import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

export default function AccordionTabsDemo() {
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
      type="single"
      collapsible
      defaultValue="item-0"
      className="w-full space-y-2"
    >
      {items.map(({ title, content }, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="border-none rounded-md px-4 data-[state=open]:bg-secondary"
        >
          <AccordionTrigger className="data-[state=closed]:py-2">
            {title}
          </AccordionTrigger>
          <AccordionContent>{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
