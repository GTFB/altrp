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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { buttonStyles } from "@/lib/button-styles";

export default function AlertDialogCustomDemo() {
  const t = useTranslations('demo.alertDialog.items');

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className={buttonStyles.outline}>
          {t('custom.trigger')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {t('custom.title')}
            <Badge variant="secondary" className="ml-auto">New</Badge>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            {t('custom.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t('custom.features')}</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {t('custom.feature1')}</li>
            <li>• {t('custom.feature2')}</li>
            <li>• {t('custom.feature3')}</li>
          </ul>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel className={buttonStyles.outline}>
            {t('custom.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction className={buttonStyles.primary}>
            {t('custom.upgrade')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
