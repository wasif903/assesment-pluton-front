import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBlogs, deleteBlog } from "../api/blog";
import { toast } from "react-toastify";

const BlogDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = Array.isArray(user?.role) ? user.role.includes("Admin") : user?.role === "Admin";
  const isOwner = user?._id && blog?.createdBy === user._id;

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBlogs();
        const foundBlog = (data.blogs || data).find((b: any) => b._id === id);
        if (!foundBlog) {
          throw new Error("Blog not found");
        }
        setBlog(foundBlog);
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || "Failed to load blog.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBlog();
  }, [id]);

  const handleDelete = async () => {
    if (!blog?._id) {
      toast.error("Blog ID not found");
      return;
    }
    
    // Custom confirmation using react-toastify
    const confirmed = await new Promise((resolve) => {
      toast.info(
        <div className="text-center">
          <p className="font-semibold mb-2">Are you sure you want to delete this blog?</p>
          <p className="text-sm text-gray-600 mb-4">"{blog.title}"</p>
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

    setIsDeleting(true);
    try {
      await deleteBlog(blog._id, user._id);
      toast.success("Blog deleted successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete blog. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Blog not found</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Try different possible image field names
  const imageField = blog.featuredImage || blog.image || blog.imageUrl;
  const imageUrl = imageField 
    ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${imageField}`
    : "https://archive.org/download/placeholder-image/placeholder-image.jpg";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blogs
          </Link>
        </div>

        {/* Blog Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          <div className="w-full h-96 relative">
            <img
              src={imageUrl}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://archive.org/download/placeholder-image/placeholder-image.jpg";
              }}
            />
          </div>

          {/* Blog Header */}
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
            
            {/* Meta Information */}
            <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>By {blog.createdBy?.username || blog.createdByName || "Unknown"}</span>
                <span>•</span>
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {isOwner && (
                  <>
                    <button
                      onClick={() => navigate(`/update-blog/${blog._id}`)}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      disabled={isDeleting}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </>
                )}
                {isAdmin && !isOwner && (
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Blog Description */}
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {blog.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails; 