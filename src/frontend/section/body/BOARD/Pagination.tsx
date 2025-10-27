interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;
  
  return (
    <div className="flex items-center justify-center space-x-4 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        이전
      </button>
      
      <span className="text-sm text-gray-600">
        <span className="font-semibold text-blue-600">{currentPage + 1}</span>
        {' '}/{' '}
        <span className="font-semibold">{totalPages}</span>
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        다음
      </button>
    </div>
  );
}

