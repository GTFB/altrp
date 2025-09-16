import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AlertWarningDemo() {
  const t = useTranslations('demo.alert.items');

  return (
    <Alert className="border-amber-500/50 text-amber-500 dark:border-amber-500 [&>svg]:text-amber-500">
      <AlertTriangleIcon className="size-4" />
      <AlertTitle>{t('warning.title')}</AlertTitle>
      <AlertDescription className="text-amber-500">
        {t('warning.content')}
      </AlertDescription>
    </Alert>
  );
}
