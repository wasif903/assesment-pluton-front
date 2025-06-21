import React from "react";

interface BlogCardProps {
  image: string;
  title: string;
  description: string;
  tags: string[];
  createdByName: string;
  createdAt: string; // ISO string or formatted date
}

function truncateWords(text: string, wordLimit: number) {
  const words = text.split(" ");
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
}

const BlogCard: React.FC<BlogCardProps> = ({
  image,
  title,
  description,
  tags,
  createdByName,
  createdAt,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row max-w-2xl mx-auto">
      <img
        src={image}
        alt={title}
        className="w-full h-48 md:w-56 md:h-auto object-cover"
      />
      <div className="p-6 flex flex-col flex-1">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">{title}</h2>
        <p className="text-gray-600 mb-4">{truncateWords(description, 50)}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
          <span>By {createdByName}</span>
          <span>{createdAt}</span>
        </div>
      </div>
    </div>
  );
};

export default BlogCard; 