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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl";
import { buttonStyles } from "@/lib/button-styles";

export default function AlertDialogScrollableDemo() {
  const t = useTranslations('demo.alertDialog.items');

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className={buttonStyles.outline}>
          {t('scrollable.trigger')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('scrollable.title')}</AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            {t('scrollable.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <ScrollArea className="h-48 w-full rounded-md border p-4">
          <div className="space-y-2">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="text-sm">
                {t('scrollable.item', { number: i + 1 })}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <AlertDialogFooter>
          <AlertDialogCancel className={buttonStyles.outline}>
            {t('scrollable.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction className={buttonStyles.primary}>
            {t('scrollable.accept')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
