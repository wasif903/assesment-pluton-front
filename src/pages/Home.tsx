import React, { useState, useEffect, useCallback } from "react";
import BlogCard from "../components/BlogCard";
import { Link } from "react-router-dom";
import { getBlogs } from "../api/blog";

const Home: React.FC = () => {
  const [search, setSearch] = useState("");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!user;
  const isAdmin = Array.isArray(user?.role) ? user.role.includes("Admin") : user?.role === "Admin";
  const [searching, setSearching] = useState(false);

  const fetchBlogs = useCallback(async (searchTerm?: string, page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: page,
        limit: pageSize
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
        setCurrentPage(data.meta.page);
      } else if (Array.isArray(data)) {
        setBlogs(data);
        setTotalPages(1);
        setTotalBlogs(data.length);
        setCurrentPage(1);
      } else {
        setBlogs([]);
        setTotalPages(1);
        setTotalBlogs(0);
        setCurrentPage(1);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load blogs.");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchBlogs("", 1);
  }, [fetchBlogs]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1); // Reset to first page when searching

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearching(true); // Start search spinner immediately

    // Set new timeout for 2 seconds
    const timeout = setTimeout(() => {
      fetchBlogs(value, 1);
    }, 2000);

    setSearchTimeout(timeout);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBlogs(search, page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1);
    fetchBlogs(search, 1);
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
      <div className="flex flex-col items-center mt-8 space-y-4">
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
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-4 text-blue-700">Blog Posts</h1>
      
      {/* Search and Controls */}
      <div className="flex justify-center mb-8 items-center gap-4 flex-wrap">
        <div className="relative">
          <input
            type="text"
            placeholder="Search blog by title..."
            value={search}
            onChange={handleSearchChange}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {isLoggedIn && !isAdmin && (
          <Link
            to="/create-blog"
            className="ml-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition whitespace-nowrap"
          >
            Create Blog
          </Link>
        )}
      </div>

      {/* Results Info */}
      <div className="text-center mb-4 text-sm text-gray-600">
        Showing {blogs.length} of {totalBlogs} blogs
        {search && ` matching "${search}"`}
        {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading blogs...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          <div className="space-y-8 max-w-3xl mx-auto">
            {blogs.length === 0 ? (
              <div className="text-center text-gray-500">
                {search ? `No blogs found matching "${search}"` : "No blogs found."}
              </div>
            ) : (
              blogs.map((blog, idx) => {
                console.log("Blog featuredImage:", blog.featuredImage);
                console.log("Blog image:", blog.image);
                console.log("Blog imageUrl:", blog.imageUrl);
                
                // Try different possible image field names
                const imageField = blog.featuredImage || blog.image || blog.imageUrl;
                const imageUrl = imageField 
                  ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${imageField}`
                  : "https://archive.org/download/placeholder-image/placeholder-image.jpg";
                
                console.log("Final image URL:", imageUrl);
                
                return (
                  <BlogCard key={blog._id || idx}
                    image={imageUrl}
                    title={blog.title}
                    description={blog.description}
                    tags={blog.tags}
                    createdByName={blog.createdBy?.username || blog.createdByName || "Unknown"}
                    createdAt={blog.createdAt}
                    createdById={blog.createdBy || ""}
                    blogId={blog._id}
                  />
                );
              })
            )}
          </div>
          
          {/* Pagination - Now below the blog list */}
          {blogs.length > 0 && (
            <div className="mt-8">
              {/* Page Size Selector - Now at bottom */}
              <div className="flex justify-center mb-4">
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
              
              {/* Pagination Controls */}
              {renderPagination()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home; 