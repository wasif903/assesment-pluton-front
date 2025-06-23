import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getBlogs, deleteBlog } from "../api/blog";
import { toast } from "react-toastify";

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  // Get values from URL params
  const search = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("limit") || "10");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const fetchBlogs = useCallback(async (searchTerm?: string, page: number = 1, limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: page,
        limit: limit
      };
      if (searchTerm && searchTerm.trim()) {
        params.search = { title: searchTerm.trim() };
      }
      const data = await getBlogs(params);
      
      // Handle API response with meta object
      if (data.blogs && data.meta) {
        setBlogs(data.blogs);
        setTotalPages(data.meta.totalPages);
        setTotalBlogs(data.meta.totalItems);
      } else if (Array.isArray(data)) {
        setBlogs(data);
        setTotalPages(1);
        setTotalBlogs(data.length);
      } else {
        setBlogs([]);
        setTotalPages(1);
        setTotalBlogs(0);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load blogs.");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, []);

  // State for pagination
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

  useEffect(() => {
    fetchBlogs(search, currentPage, pageSize);
  }, [fetchBlogs, search, currentPage, pageSize]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearching(true);

    // Set new timeout for 2 seconds
    const timeout = setTimeout(() => {
      const newSearchParams = new URLSearchParams(searchParams);
      if (value.trim()) {
        newSearchParams.set("search", value.trim());
      } else {
        newSearchParams.delete("search");
      }
      newSearchParams.set("page", "1"); // Reset to first page when searching
      setSearchParams(newSearchParams);
    }, 2000);

    setSearchTimeout(timeout);
  };

  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", page.toString());
    setSearchParams(newSearchParams);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("limit", newPageSize.toString());
    newSearchParams.set("page", "1"); // Reset to first page when changing page size
    setSearchParams(newSearchParams);
  };

  const handleDelete = async (blogId: string, blogTitle: string) => {
    // Custom confirmation using react-toastify
    const confirmed = await new Promise((resolve) => {
      toast.info(
        <div className="text-center">
          <p className="font-semibold mb-2">Are you sure you want to delete this blog?</p>
          <p className="text-sm text-gray-600 mb-4">"{blogTitle}"</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                toast.dismiss();
                resolve(true);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => {
                toast.dismiss();
                resolve(false);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
        }
      );
    });

    if (!confirmed) return;

    setDeletingBlogId(blogId);
    try {
      await deleteBlog(blogId, user._id);
      toast.success("Blog deleted successfully!");
      fetchBlogs(search, currentPage, pageSize); // Refresh current page
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete blog. Please try again.");
    } finally {
      setDeletingBlogId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return dateString;
    }
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    
    // Generate page numbers
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
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
      <div className="flex flex-col items-center mt-6 space-y-4">
        {/* Pagination Info */}
        <div className="text-sm text-gray-600 space-x-4">
          <span>Total Pages: {totalPages}</span>
          <span>Current Page: {currentPage}</span>
          <span>Total Items: {totalBlogs}</span>
        </div>
        
        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {pages}
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">Admin Dashboard</h1>
        
        {/* Search and Controls */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search blogs by title..."
                defaultValue={search}
                onChange={handleSearchChange}
                className="w-64 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {blogs.length} of {totalBlogs} blogs
            {search && ` matching "${search}"`}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blogs...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <>
            {/* Blogs Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blog
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tags
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {blogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          {search ? `No blogs found matching "${search}"` : "No blogs found."}
                        </td>
                      </tr>
                    ) : (
                      blogs.map((blog) => {
                        const imageField = blog.featuredImage || blog.image || blog.imageUrl;
                        const imageUrl = imageField 
                          ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${imageField}`
                          : "https://archive.org/download/placeholder-image/placeholder-image.jpg";

                        return (
                          <tr key={blog._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  <img
                                    className="h-12 w-12 rounded object-cover"
                                    src={imageUrl}
                                    alt={blog.title}
                                    onError={(e) => {
                                      e.currentTarget.src = "https://archive.org/download/placeholder-image/placeholder-image.jpg";
                                    }}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {truncateText(blog.title, 50)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {truncateText(blog.description, 80)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {blog.createdBy?.username || blog.createdByName || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {blog.tags && blog.tags.slice(0, 3).map((tag: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {blog.tags && blog.tags.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    +{blog.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(blog.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => window.open(`/blog/${blog._id}`, '_blank')}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="View Blog"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(blog._id, blog.title)}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                  disabled={deletingBlogId === blog._id}
                                  title="Delete Blog"
                                >
                                  {deletingBlogId === blog._id ? (
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 