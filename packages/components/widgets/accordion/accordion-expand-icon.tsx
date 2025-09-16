import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AccordionExpandIconDemo() {
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
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-45 text-sm [&>svg]:hidden">
            {title}
            <Plus className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
          </AccordionTrigger>
          <AccordionContent>{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
