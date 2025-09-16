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
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonStyles } from "@/lib/button-styles";

export default function AlertDialogAnimatedDemo() {
  const t = useTranslations('demo.alertDialog.items');

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="btn-outline relative overflow-hidden">
          <span className="relative z-10">{t('animated.trigger')}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="animate-in zoom-in-95 duration-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            {t('animated.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            {t('animated.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel className={buttonStyles.outline}>
            {t('animated.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction className={buttonStyles.primary}>
            {t('animated.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
