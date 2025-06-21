import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteBlog } from "../api/blog";
import { toast } from "react-toastify";
import { formatDate, truncateWords, isAdmin, isOwner, getUserFromStorage } from "../utils";
import { showDeleteConfirmation } from "./DeleteConfirmation";
import TagList from "./TagList";

interface BlogCardProps {
  image: string;
  title: string;
  description: string;
  tags: string[];
  createdByName: string;
  createdAt: string; // ISO string or formatted date
  createdById: string;
  blogId?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  image,
  title,
  description,
  tags,
  createdByName,
  createdAt,
  createdById,
  blogId,
}) => {
  const user = getUserFromStorage();
  const userIsAdmin = isAdmin(user);
  const userIsOwner = isOwner(user, createdById);

  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(image);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleImageError = () => {
    console.log("Image failed to load:", image);
    setImageError(true);
    setImageSrc("https://archive.org/download/placeholder-image/placeholder-image.jpg");
  };

  // Update image source when image prop changes
  useEffect(() => {
    setImageSrc(image);
    setImageError(false);
  }, [image]);

  const handleDelete = async () => {
    if (!blogId) {
      toast.error("Blog ID not found");
      return;
    }
    
    const confirmed = await showDeleteConfirmation({
      title: "Are you sure you want to delete this blog?",
      itemName: title,
      onConfirm: () => {},
      onCancel: () => {}
    });

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteBlog(blogId, user!._id);
      toast.success("Blog deleted successfully!");
      // Refresh the page to update the blog list
      window.location.reload();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete blog. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  console.log("BlogCard image URL:", imageSrc);

  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row max-w-2xl mx-auto">
      <img
        src={imageSrc}
        alt={title}
        className="w-full h-48 md:w-56 md:h-auto object-cover"
        onError={handleImageError}
      />
      <div className="p-6 flex flex-col flex-1">
        <h2 
          className="text-2xl font-bold mb-2 text-gray-800 cursor-pointer hover:text-blue-600 transition"
          onClick={() => blogId && navigate(`/blog/${blogId}`)}
        >
          {title}
        </h2>
        <p className="text-gray-600 mb-4">{truncateWords(description, 50)}</p>
        <TagList tags={tags} className="mb-4" />
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
          <span>By {createdByName}</span>
          <span>{formatDate(createdAt)}</span>
        </div>
        <div className="flex gap-2 mt-2">
          {userIsAdmin && (
            <button 
              title="Delete" 
              className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
          {userIsOwner && (
            <>
              <button 
                title="Edit" 
                className="text-blue-500 hover:text-blue-700 disabled:opacity-50" 
                onClick={() => blogId && navigate(`/update-blog/${blogId}`)}
                disabled={isDeleting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button 
                title="Delete" 
                className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogCard; 