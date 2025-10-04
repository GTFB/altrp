import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

const navigationMenuItems = [
  { title: "Home", href: "#" },
  { title: "Blog", href: "#blog" },
  { title: "Docs", href: "#docs" },
];

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navigationMenuItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Link href={{ pathname: item.href }}>{item.title}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
