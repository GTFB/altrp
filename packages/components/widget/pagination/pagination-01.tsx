import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function PaginationDemo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={{ pathname: "#" }} size="default" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href={{ pathname: "#" }} size="default">
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href={{ pathname: "#" }} isActive size="default">
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href={{ pathname: "#" }} size="default">
            3
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href={{ pathname: "#" }} size="default" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
