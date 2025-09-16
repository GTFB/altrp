import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AlertInfoDemo() {
  const t = useTranslations('demo.alert.items');

  return (
    <Alert className="border-cyan-600/50 text-cyan-600 dark:border-cyan-600 [&>svg]:text-cyan-600">
      <InfoIcon className="size-4" />
      <AlertTitle>{t('info.title')}</AlertTitle>
      <AlertDescription className="text-cyan-600">
        {t('info.content')}
      </AlertDescription>
    </Alert>
  );
}
