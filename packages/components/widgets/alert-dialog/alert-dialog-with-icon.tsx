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
import { OctagonAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonStyles } from "@/lib/button-styles";

export default function AlertDialogWithIconDemo() {
  const t = useTranslations('demo.alertDialog.items');

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className={buttonStyles.outline}>
          {t('withIcon.trigger')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className="mx-auto sm:mx-0 mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
              <OctagonAlert className="h-5 w-5 text-destructive" />
            </div>
            {t('withIcon.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            {t('withIcon.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className={buttonStyles.outline}>{t('withIcon.cancel')}</AlertDialogCancel>
          <AlertDialogAction className={buttonStyles.primary}>{t('withIcon.continue')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
