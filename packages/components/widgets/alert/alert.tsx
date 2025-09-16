import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleFadingArrowUpIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AlertDemo() {
  const t = useTranslations('demo.alert.items');

  return (
    <Alert>
      <CircleFadingArrowUpIcon className="size-4" />
      <AlertTitle>{t('update.title')}</AlertTitle>
      <AlertDescription>
        {t('update.content')}
      </AlertDescription>
    </Alert>
  );
}
