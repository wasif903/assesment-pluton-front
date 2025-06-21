import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export const usePagination = (defaultPageSize: number = 10) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get values from URL params
  const currentPage = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("limit") || defaultPageSize.toString());
  
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const updatePagination = useCallback((meta: { totalPages: number; totalItems: number; page: number }) => {
    setTotalPages(meta.totalPages);
    setTotalItems(meta.totalItems);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", page.toString());
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("limit", newPageSize.toString());
    newSearchParams.set("page", "1"); // Reset to first page when changing page size
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  const resetToFirstPage = useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    updatePagination,
    handlePageChange,
    handlePageSizeChange,
    resetToFirstPage
  };
}; 