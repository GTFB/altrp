import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OctagonAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AlertWithBackgroundDemo() {
  const t = useTranslations('demo.alert.items');

  return (
    <Alert className="bg-muted">
      <OctagonAlertIcon className="size-4" />
      <AlertTitle className="text-foreground">{t('error.title')}</AlertTitle>
      <AlertDescription className="text-foreground">
        {t('error.content')}
      </AlertDescription>
    </Alert>
  );
}
