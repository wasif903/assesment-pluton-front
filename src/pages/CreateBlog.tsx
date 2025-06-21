import React, { useState } from "react";
import FormFieldError from "../components/FormFieldError";
import { createBlog } from "../api/blog";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CreateBlog: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};
    if (!title.trim()) errors.title = "Title is required.";
    if (!description.trim()) errors.description = "Description is required.";
    if (!featuredImage) errors.featuredImage = "Featured image is required.";
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
      await createBlog(user._id, formData);
      toast.success("Blog created successfully!");
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
        toast.error("Failed to create blog. Try again.");
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
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Create Blog</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              required
            />
            <FormFieldError error={fieldErrors.featuredImage} />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 max-h-40 rounded" />
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
            {isSubmitting ? "Creating..." : "Create Blog"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog; 