import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ClickableLinkBadgeDemo() {
  const t = useTranslations('demo.badge');

  return (
    <div className="flex items-center space-x-2">
      <Link
        href="https://github.com/shadcn"
        target="_blank"
        className={cn(
          badgeVariants({
            variant: "outline",
          }),
          "rounded-full pl-[3px]"
        )}
      >
        <Image
          src="https://github.com/shadcn.png"
          className="mr-2 h-5 w-5 rounded-full"
          alt=""
          height={20}
          width={20}
        />
        {t('withImage.shadcn')}
      </Link>
      <Link
        href="https://github.com/vercel"
        target="_blank"
        className={cn(
          badgeVariants({
            variant: "secondary",
          }),
          "rounded-full pr-[3px]"
        )}
      >
        {t('withImage.vercel')}
        <Image
          src="https://github.com/vercel.png"
          className="ml-2 h-5 w-5 rounded-full"
          alt=""
          height={20}
          width={20}
        />
      </Link>
    </div>
  );
}
