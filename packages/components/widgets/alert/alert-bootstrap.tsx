import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  CircleFadingArrowUpIcon,
  OctagonAlert,
  ShieldAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function AlertBootstrapDemo() {
  const t = useTranslations('demo.alert.items');

  return (
    <div className="w-full space-y-4">
      <Alert className="bg-emerald-600/10 dark:bg-emerald-600/15 text-emerald-500 border-emerald-500/50 dark:border-emerald-600/50">
        <CircleFadingArrowUpIcon className="size-4" />
        <AlertTitle>{t('success.title')}</AlertTitle>
      </Alert>
      <Alert className="bg-blue-500/10 dark:bg-blue-600/20 text-blue-500 dark:text-blue-400 border-blue-400/50 dark:border-blue-600/60">
        <CircleFadingArrowUpIcon className="size-4" />
        <AlertTitle>{t('update.title')}</AlertTitle>
      </Alert>
      <Alert className="bg-amber-600/10 dark:bg-amber-600/15 text-amber-500 border-amber-500/50 dark:border-amber-600/50">
        <ShieldAlert className="size-4" />
        <AlertTitle>{t('warning.title')}</AlertTitle>
      </Alert>
      <Alert className="bg-destructive/10 dark:bg-destructive/15 text-destructive border-destructive/30 dark:border-destructive/50">
        <OctagonAlert className="size-4" />
        <AlertTitle>
          {t('error.title')}
        </AlertTitle>
      </Alert>
    </div>
  );
}
