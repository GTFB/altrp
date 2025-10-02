import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookCheck,
  ChartPie,
  FolderSync,
  Goal,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Goal,
    title: "Выявление Возможностей",
    description:
      "Легко находите неиспользованные области для исследования и расширения вашего охвата быстро и эффективно.",
  },
  {
    icon: BookCheck,
    title: "Создание Авторитета",
    description:
      "Создавайте ценный контент, который находит отклик, внушает доверие и позиционирует вас как эксперта.",
  },
  {
    icon: ChartPie,
    title: "Мгновенная Аналитика",
    description:
      "Получайте немедленные, действенные инсайты одним взглядом, обеспечивая быстрое принятие решений.",
  },
  {
    icon: Users,
    title: "Взаимодействие с Аудиторией",
    description:
      "Повышайте вовлеченность аудитории с помощью интерактивных функций: опросов, викторин и форм.",
  },
  {
    icon: FolderSync,
    title: "Автоматизация Рабочих Процессов",
    description:
      "Оптимизируйте процессы, автоматизируя повторяющиеся задачи, экономя время и снижая трудозатраты.",
  },
  {
    icon: Zap,
    title: "Ускорение Роста",
    description:
      "Ускоряйте рост, внедряя стратегии, которые быстро и эффективно приводят к результатам.",
  },
];

const Features04Page = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-(--breakpoint-lg) w-full py-12 px-6">
        <h2 className="text-4xl md:text-5xl md:leading-14 font-semibold tracking-[-0.03em] max-w-lg">
          Усильте Свою Стратегию с Умными Функциями
        </h2>
        <div className="mt-6 md:mt-10 w-full mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <Accordion defaultValue="item-0" type="single" className="w-full">
              {features.map(({ title, description, icon: Icon }, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="group/accordion-item data-[state=open]:border-b-2 data-[state=open]:border-primary"
                >
                  <AccordionTrigger className="text-lg [&>svg]:hidden group-first/accordion-item:pt-0">
                    <div className="flex items-center gap-4">
                      <Icon />
                      {title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-[17px] leading-relaxed text-muted-foreground">
                    {description}
                    <div className="mt-6 mb-2 md:hidden aspect-video w-full bg-muted rounded-xl" />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Media */}
          <div className="hidden md:block w-full h-full bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default Features04Page;
