import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormFieldError from "../components/FormFieldError";
import { getBlogs, updateBlog } from "../api/blog";
import { toast } from "react-toastify";

const UpdateBlog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBlogs();
        const blog = (data.blogs || data.data || data).find((b: any) => b._id === id);
        if (!blog) throw new Error("Blog not found");
        
        console.log("Blog data for update:", blog);
        console.log("Blog featuredImage:", blog.featuredImage);
        console.log("Blog image:", blog.image);
        console.log("Blog imageUrl:", blog.imageUrl);
        
        setTitle(blog.title || "");
        setDescription(blog.description || "");
        setTags(blog.tags || []);
        setTagsInput((blog.tags || []).join(", "));
        
        // Try different possible image field names
        const imageField = blog.featuredImage || blog.image || blog.imageUrl;
        if (imageField) {
          const imageUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${imageField}`;
          console.log("Setting image preview URL:", imageUrl);
          setImagePreview(imageUrl);
        } else {
          console.log("No image field found");
          setImagePreview("");
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || "Failed to load blog.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBlog();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};
    if (!title.trim()) errors.title = "Title is required.";
    if (!description.trim()) errors.description = "Description is required.";
    if (tags.length === 0) errors.tags = "At least one tag is required.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user?._id) throw new Error("User not found. Please login again.");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (featuredImage) formData.append("featuredImage", featuredImage);
      tags.forEach((tag, idx) => formData.append(`tags[${idx}]`, tag));

      await updateBlog(id!, user._id, formData);
      toast.success("Blog updated successfully!");
      navigate("/");
    } catch (error: any) {
      if (error?.response?.data?.details && Array.isArray(error.response.data.details)) {
        const errors: { [key: string]: string } = {};
        error.response.data.details.forEach((msg: string) => {
          if (msg.toLowerCase().includes("title")) errors.title = msg;
          else if (msg.toLowerCase().includes("description")) errors.description = msg;
          else if (msg.toLowerCase().includes("image")) errors.featuredImage = msg;
          else if (msg.toLowerCase().includes("tag")) errors.tags = msg;
        });
        setFieldErrors(errors);
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update blog. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    setTags(
      e.target.value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFeaturedImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Setting new image preview");
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("No file selected, keeping existing preview");
    }
  };

  if (loading) return <div className="text-center py-8">Loading blog...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Update Blog</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 mb-1">Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <FormFieldError error={fieldErrors.title} />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
            <FormFieldError error={fieldErrors.description} />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Featured Image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleImageChange}
            />
            <FormFieldError error={fieldErrors.featuredImage} />
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-40 rounded border"
                  onError={(e) => {
                    console.log("Image preview failed to load:", imagePreview);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Image preview</p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={tagsInput}
              onChange={handleTagsChange}
              placeholder="e.g. travel, food, coding"
            />
            <FormFieldError error={fieldErrors.tags} />
            <div className="mt-1 text-xs text-gray-500">Tags: {tags.join(", ")}</div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Blog"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateBlog; 