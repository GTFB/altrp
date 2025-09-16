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
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonStyles } from "@/lib/button-styles";

export default function AlertDialogInfoDemo() {
  const t = useTranslations('demo.alertDialog.items');

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className={buttonStyles.outline}>
          {t('info.trigger')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            {t('info.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            {t('info.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('info.cancel')}</AlertDialogCancel>
          <AlertDialogAction className={buttonStyles.primary}>
            {t('info.learnMore')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
