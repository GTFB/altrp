import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Contrast, Palette, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AccordionDisabledDemo() {
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
      disabled: true,
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
      {items.map(({ title, content, icon: Icon, disabled }, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger
            disabled={disabled}
            className={cn({
              "opacity-50": disabled,
            })}
          >
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
