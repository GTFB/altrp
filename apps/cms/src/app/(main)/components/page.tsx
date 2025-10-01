import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComponentsHeader } from "@/components/misc/components-header";
import { PROJECT_SETTINGS } from "@/settings";
import { useTranslations } from "next-intl";
import { 
  ChevronDown,
  ChevronRight,
  Code,
  Layout,
  AlertTriangle,
  AlertCircle,
  User,
  Tag,
  Navigation,
  MousePointer,
  CreditCard,
  RotateCcw,
  CheckSquare,
  ChevronsUpDown,
  MoreHorizontal
} from "lucide-react";
import { cardStyles } from "@/lib/button-styles";

export default function ComponentsPage() {
  const t = useTranslations('components');
  
  const componentCategories = [
    {
      title: t('accordion.title'),
      description: t('accordion.description'),
      href: "/components/accordion",
      icon: ChevronDown,
      count: 12,
      color: "bg-blue-500",
      variants: ["Default", "Outline", "Box", "Tabs", "Custom Trigger", "Disabled", "Media Content", "Highlight Active", "Box Contained", "Multiple", "Icon", "Expand Icon"]
    },
    {
      title: t('alert.title'),
      description: t('alert.description'),
      href: "/components/alert",
      icon: AlertTriangle,
      count: 10,
      color: "bg-orange-500",
      variants: ["Destructive", "Success", "Warning", "Info", "With Background", "Soft", "Bootstrap", "Callout", "With Actions", "Primary"]
    },
    {
      title: t('alertDialog.title'),
      description: t('alertDialog.description'),
      href: "/components/alert-dialog",
      icon: AlertCircle,
      count: 10,
      color: "bg-red-500",
      variants: ["Default", "With Icon", "Destructive", "Success", "Warning", "Info", "Custom", "Form", "Scrollable", "Animated"]
    },
    {
      title: t('avatar.title'),
      description: t('avatar.description'),
      href: "/components/avatar",
      icon: User,
      count: 14,
      color: "bg-indigo-500",
      variants: ["Default", "Clickable", "Tooltip", "With Text", "Hover Card", "Sizes", "Fallback", "Colors", "Shapes", "Ring", "Status", "Badge", "Group", "Group Max"]
    },
    {
      title: t('badge.title'),
      description: t('badge.description'),
      href: "/components/badge",
      icon: Tag,
      count: 10,
      color: "bg-green-500",
      variants: ["Default", "Rounded", "Gradient", "Gradient Outline", "Soft", "Status", "With Image", "With Icon", "Clickable", "Clickable Link"]
    },
    {
      title: t('breadcrumb.title'),
      description: t('breadcrumb.description'),
      href: "/components/breadcrumb",
      icon: Navigation,
      count: 15,
      color: "bg-cyan-500",
      variants: ["Default", "Slash Separator", "Chevrons Separator", "Dot Separator", "With Icon", "With Icon 2", "With Icon and Label", "With Icon and Label 2", "With Background", "Tab Active", "Tabs", "Tabs Outline", "With Dropdown", "Collapsed", "Steps"]
    },
    {
      title: t('button.title'),
      description: t('button.description'),
      href: "/components/button",
      icon: MousePointer,
      count: 23,
      color: "bg-pink-500",
      variants: ["Primary", "Secondary", "Destructive", "Outline", "Icon", "Loading", "Split", "Ghost", "Gradient", "Link", "Social", "Social Login", "Neon", "Rounded", "Toggle", "Theme Toggle", "Full Width", "Group", "Group 2", "Copy", "With Badge", "With Tooltip", "With Tap Animation"]
    },
    {
      title: t('card.title'),
      description: t('card.description'),
      href: "/components/card",
      icon: CreditCard,
      count: 8,
      color: "bg-teal-500",
      variants: ["Default", "With Background", "Sign Up", "Banner", "Pricing", "Post", "Product", "Testimonial"]
    },
    {
      title: t('carousel.title'),
      description: t('carousel.description'),
      href: "/components/carousel",
      icon: RotateCcw,
      count: 11,
      color: "bg-violet-500",
      variants: ["Default", "Multiple Slides", "Vertical", "Slide Status", "Slide Status 2", "Pagination", "Footer", "Progress", "Thumbs", "Opacity", "Scale"]
    },
    {
      title: t('checkbox.title'),
      description: t('checkbox.description'),
      href: "/components/checkbox",
      icon: CheckSquare,
      count: 12,
      color: "bg-emerald-500",
      variants: ["With Text", "Disabled", "Indeterminate", "Horizontal Group", "Vertical Group", "Controlled", "Colors", "Sizes", "Icon", "Multi Color Picker", "Card", "With Form"]
    },
    {
      title: t('collapsible.title'),
      description: t('collapsible.description'),
      href: "/components/collapsible",
      icon: ChevronsUpDown,
      count: 4,
      color: "bg-amber-500",
      variants: ["Default", "Show More", "File Tree", "Filters"]
    },
    {
      title: t('dropdown.title'),
      description: t('dropdown.description'),
      href: "/components/dropdown",
      icon: MoreHorizontal,
      count: 8,
      color: "bg-purple-500",
      variants: ["Default", "With Icon", "Checkboxes", "Radio Group", "Sub Menu", "Shortcuts", "Complex Menu", "Workspace Switcher"]
    },
    {
      title: t('layout.title'),
      description: t('layout.description'),
      href: "/components/layout",
      icon: Layout,
      count: 5,
      color: "bg-gray-500",
      variants: ["Component Layout", "Demo Grid", "Code Example", "Inline Code", "Variant Demo"]
    }
  ];
  return (
    <div className="min-h-screen bg-background">
      <ComponentsHeader
        title={t('title')}
        showHomeButton={false}
        badges={[]}
      />

      <div className={`mx-auto py-8 space-y-8 max-w-7xl ${PROJECT_SETTINGS.mobilePadding}`}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {componentCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link key={category.title} href={category.href}>
                <Card className="group cursor-pointer h-full flex flex-col">
                  <CardHeader className="space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${category.color} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{category.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed line-clamp-3">
                        {category.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 mt-auto">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {category.count} {t('count')}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">{t('variants')}</p>
                      <div className="flex flex-wrap gap-1 min-h-[24px]">
                        {category.variants.slice(0, 3).map((variant) => (
                          <Badge key={variant} variant="outline" className="text-xs">
                            {variant}
                          </Badge>
                        ))}
                        {category.variants.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.variants.length - 3} {t('more')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card className={`mt-12 ${cardStyles.info}`}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4 sm:flex-row sm:items-center sm:text-left sm:space-y-0 sm:space-x-4">
              <Code className="h-6 w-6 text-muted-foreground flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>{t('howToUse.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('howToUse.description')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
