import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  CircleFadingArrowUpIcon,
  OctagonAlert,
  ShieldAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function AlertSoftDemo() {
  const t = useTranslations('demo.alert.items');

  return (
    <div className="w-full space-y-4">
      <Alert className="bg-emerald-600/10 dark:bg-emerald-600/15 text-emerald-500 border-none">
        <CircleFadingArrowUpIcon className="size-4" />
        <AlertTitle>{t('success.title')}</AlertTitle>
      </Alert>
      <Alert className="bg-blue-500/10 dark:bg-blue-600/20 text-blue-500 border-none">
        <CircleFadingArrowUpIcon className="size-4" />
        <AlertTitle>{t('update.title')}</AlertTitle>
      </Alert>
      <Alert className="bg-amber-600/10 dark:bg-amber-600/15 text-amber-500 border-none">
        <ShieldAlert className="size-4" />
        <AlertTitle>{t('warning.title')}</AlertTitle>
      </Alert>
      <Alert className="bg-destructive/10 dark:bg-destructive/15 text-destructive border-none">
        <OctagonAlert className="size-4" />
        <AlertTitle>
          {t('error.title')}
        </AlertTitle>
      </Alert>
    </div>
  );
}
