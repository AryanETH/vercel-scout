import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface ResultsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ResultsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ResultsPaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (currentPage > 3) pages.push("ellipsis");
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <Pagination className="mt-6 sm:mt-8">
      <PaginationContent className="gap-0.5 sm:gap-1">
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={cn(
              currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer",
              "px-2 sm:px-4"
            )}
          />
        </PaginationItem>

        {getVisiblePages().map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`} className="hidden sm:flex">
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={cn(
              currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer",
              "px-2 sm:px-4"
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
