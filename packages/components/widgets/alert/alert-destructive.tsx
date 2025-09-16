import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OctagonAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AlertDestructiveDemo() {
  const t = useTranslations('demo.alert.items');

  return (
    <Alert variant="destructive">
      <OctagonAlertIcon className="size-4" />
      <AlertTitle>{t('error.title')}</AlertTitle>
      <AlertDescription>
        {t('error.content')}
      </AlertDescription>
    </Alert>
  );
}
