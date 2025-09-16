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
import { useTranslations } from "next-intl";
import { buttonStyles } from "@/lib/button-styles";

export default function AlertDialogDemo() {
  const t = useTranslations('demo.alertDialog.items');

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          className={buttonStyles.outline}
        >
          {t('default.trigger')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('default.title')}</AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            {t('default.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className={buttonStyles.outline}>
            {t('default.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction className={buttonStyles.primary}>
            {t('default.continue')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
