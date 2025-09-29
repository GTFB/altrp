import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function PaginationNumberless() {
  return (
    <Pagination>
      <PaginationContent className="gap-0 border rounded-lg divide-x overflow-hidden">
        <PaginationItem>
          <PaginationPrevious href="#" className="rounded-none" />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" className="rounded-none" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
