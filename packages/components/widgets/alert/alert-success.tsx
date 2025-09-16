import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleCheckBigIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AlertSuccessDemo() {
  const t = useTranslations('demo.alert.items');

  return (
    <Alert className="border-emerald-600/50 text-emerald-600 dark:border-emerald-600 [&>svg]:text-emerald-600">
      <CircleCheckBigIcon className="size-4" />
      <AlertTitle>{t('success.title')}</AlertTitle>
      <AlertDescription className="text-emerald-600">
        {t('success.content')}
      </AlertDescription>
    </Alert>
  );
}
