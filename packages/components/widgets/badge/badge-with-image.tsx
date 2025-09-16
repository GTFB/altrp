import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function BadgeWithImageDemo() {
  const t = useTranslations('demo.badge');

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Badge className="rounded-full pl-[3px]" variant="outline">
        <Image
          src="https://github.com/shadcn.png"
          className="mr-2 h-5 w-5 rounded-full"
          alt=""
          height={20}
          width={20}
        />
        {t('withImage.shadcn')}
      </Badge>
      <Badge className="rounded-full pr-[3px]" variant="outline">
        {t('withImage.shadcn')}
        <Image
          src="https://github.com/shadcn.png"
          className="ml-2 h-5 w-5 rounded-full"
          alt=""
          height={20}
          width={20}
        />
      </Badge>
    </div>
  );
}
