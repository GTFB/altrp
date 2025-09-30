import { Search } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"

import { Label } from "@/components/ui/label"
import { SidebarInput } from "@/components/ui/sidebar"

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const t = useTranslations()
  
  return (
    <form {...props}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          {t('common.search')}
        </Label>
        <SidebarInput
          id="search"
          placeholder={t('common.searchPlaceholder')}
          className="h-8 pl-7"
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
      </div>
    </form>
  )
}
