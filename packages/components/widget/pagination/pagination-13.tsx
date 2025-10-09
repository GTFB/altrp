import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function PaginationWithEllipsis() {
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
          <PaginationLink href={{ pathname: "#" }} isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href={{ pathname: "#" }}>3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href={{ pathname: "#" }} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
