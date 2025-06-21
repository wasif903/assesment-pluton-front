import React, { useState } from "react";
import BlogCard from "../components/BlogCard";

const dummyBlogs = [
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    title: "Exploring the Mountains",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut laoreet dictum, massa sapien hendrerit urna, eget dictum enim enim eu sem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam at augue non nibh tristique euismod. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nisi eu nunc. Proin euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nisi eu nunc.",
    tags: ["travel", "adventure", "mountains"],
    createdByName: "Alice Smith",
    createdAt: "2024-06-21",
  },
  {
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    title: "A Day in the City",
    description: "Suspendisse potenti. Nullam ac urna eu felis dapibus condimentum sit amet a augue. Sed non neque elit. Sed ut imperdiet nisi. Proin condimentum fermentum nunc. Etiam pharetra, erat sed fermentum feugiat, velit mauris egestas quam, ut aliquam massa nisl quis neque. Suspendisse in orci enim.",
    tags: ["city", "lifestyle", "urban"],
    createdByName: "Bob Johnson",
    createdAt: "2024-06-20",
  },
  {
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    title: "The Art of Cooking",
    description: "Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Pellentesque in ipsum id orci porta dapibus. Proin eget tortor risus.",
    tags: ["food", "cooking", "art"],
    createdByName: "Charlie Lee",
    createdAt: "2024-06-19",
  },
];

const Home: React.FC = () => {
  const [search, setSearch] = useState("");

  const filteredBlogs = dummyBlogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-4 text-blue-700">Blog Posts</h1>
      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search blog..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="space-y-8 max-w-3xl mx-auto">
        {filteredBlogs.map((blog, idx) => (
          <BlogCard key={idx} {...blog} />
        ))}
      </div>
    </div>
  );
};

export default Home; 