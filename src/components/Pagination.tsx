import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className = ""
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  
  // Generate page numbers
  for (let i = 1; i <= totalPages; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`px-3 py-2 text-sm font-medium border ${
          currentPage === i
            ? "bg-blue-600 text-white border-blue-600"
            : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50"
        }`}
      >
        {i}
      </button>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Pagination Info */}
      <div className="text-sm text-gray-600 space-x-4">
        <span>Total Pages: {totalPages}</span>
        <span>Current Page: {currentPage}</span>
        <span>Total Items: {totalItems}</span>
      </div>
      
      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {pages}
      </div>
    </div>
  );
};

export default Pagination; 