import React from 'react';

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  options?: number[];
  className?: string;
}

const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  pageSize,
  onPageSizeChange,
  options = [5, 10, 20, 50],
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm text-gray-600">Show:</label>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-600">per page</span>
    </div>
  );
};

export default PageSizeSelector; 