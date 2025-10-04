import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function ClickableAvatarDemo() {
  return (
    <Link href={{ pathname: "https://github.com/shadcn" }} target="_blank">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </Link>
  );
}
