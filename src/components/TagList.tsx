import React from 'react';

interface TagListProps {
  tags: string[];
  maxDisplay?: number;
  className?: string;
  tagClassName?: string;
}

const TagList: React.FC<TagListProps> = ({
  tags,
  maxDisplay = 3,
  className = "",
  tagClassName = "bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium"
}) => {
  if (!tags || tags.length === 0) return null;

  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayTags.map((tag, idx) => (
        <span
          key={idx}
          className={tagClassName}
        >
          #{tag}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

export default TagList; 