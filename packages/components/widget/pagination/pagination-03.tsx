import { buttonVariants } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export default function PaginationWithSecondaryButton() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={{ pathname: "#" }} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href={{ pathname: "#" }}>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href={{ pathname: "#" }}
            isActive
            className={cn(
              "shadow-none! hover:text-secondary-foreground! border-none!",
              buttonVariants({
                variant: "secondary",
                size: "icon",
              }),
            )}
          >
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href={{ pathname: "#" }}>3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href={{ pathname: "#" }} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
