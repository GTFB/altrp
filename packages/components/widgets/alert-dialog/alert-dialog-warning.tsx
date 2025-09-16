import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonStyles } from "@/lib/button-styles";

export default function AlertDialogWarningDemo() {
  const t = useTranslations('demo.alertDialog.items');

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className={buttonStyles.outline}>
          {t('warning.trigger')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {t('warning.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            {t('warning.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('warning.cancel')}</AlertDialogCancel>
          <AlertDialogAction className={buttonStyles.primary}>
            {t('warning.proceed')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
