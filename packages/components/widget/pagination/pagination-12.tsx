import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function PaginationNumberless() {
  return (
    <div className="w-full max-w-xs">
      <Pagination className="w-full">
        <PaginationContent className="w-full justify-between">
          <PaginationItem>
            <PaginationPrevious href={{ pathname: "#" }} className="border" />
          </PaginationItem>
          <PaginationItem>
            <span className="text-sm text-muted-foreground">Page 1 of 21</span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href={{ pathname: "#" }} className="border" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
