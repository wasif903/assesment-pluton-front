# Reusable Components and Utilities

This document outlines all the reusable components and utilities that have been extracted from the codebase to improve maintainability and reduce code duplication.

## 📁 Directory Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── REUSABLE_COMPONENTS.md  # This documentation
```

## 🛠️ Utility Functions (`src/utils/`)

### Date Utilities (`dateUtils.ts`)
- `formatDate(dateString: string): string` - Formats date to YYYY-MM-DD
- `formatDateForDisplay(dateString: string): string` - Formats date for human-readable display

### Text Utilities (`textUtils.ts`)
- `truncateText(text: string, maxLength: number): string` - Truncates text to specified length
- `truncateWords(text: string, wordLimit: number): string` - Truncates text by word count
- `capitalizeFirst(text: string): string` - Capitalizes first letter of text

### Image Utilities (`imageUtils.ts`)
- `getImageUrl(imageField: string | undefined): string` - Constructs full image URL
- `getBlogImageUrl(blog: any): string` - Gets image URL for blog objects
- `handleImageError(e: React.SyntheticEvent): void` - Handles image loading errors

### User Utilities (`userUtils.ts`)
- `getUserFromStorage(): User | null` - Safely gets user from localStorage
- `isLoggedIn(): boolean` - Checks if user is logged in
- `isAdmin(user: User | null): boolean` - Checks if user is admin
- `isOwner(user: User | null, blogCreatedBy: string): boolean` - Checks if user owns blog

## 🎣 Custom Hooks (`src/hooks/`)

### useDebounce (`useDebounce.ts`)
- `useDebounce<T>(value: T, delay: number): T` - Generic debounce hook
- `useSearchDebounce(callback, delay): object` - Specialized search debounce hook

### usePagination (`usePagination.ts`)
- `usePagination(defaultPageSize: number)` - Manages pagination state with URL sync
- Returns pagination state and handlers for page changes

## 🧩 Reusable Components (`src/components/`)

### Pagination (`Pagination.tsx`)
```tsx
<Pagination
  currentPage={1}
  totalPages={10}
  totalItems={100}
  onPageChange={(page) => handlePageChange(page)}
/>
```

### PageSizeSelector (`PageSizeSelector.tsx`)
```tsx
<PageSizeSelector
  pageSize={10}
  onPageSizeChange={(size) => handlePageSizeChange(size)}
  options={[5, 10, 20, 50]}
/>
```

### SearchInput (`SearchInput.tsx`)
```tsx
<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Search blogs..."
  showLoading={isSearching}
/>
```

### LoadingSpinner (`LoadingSpinner.tsx`)
```tsx
<LoadingSpinner
  size="lg"
  text="Loading blogs..."
/>
```

### TagList (`TagList.tsx`)
```tsx
<TagList
  tags={blog.tags}
  maxDisplay={3}
  className="mb-4"
/>
```

### DeleteConfirmation (`DeleteConfirmation.tsx`)
```tsx
const confirmed = await showDeleteConfirmation({
  title: "Delete Blog",
  itemName: blog.title,
  onConfirm: () => handleDelete(),
  onCancel: () => {}
});
```

## 📦 Import Examples

### Import all utilities
```tsx
import { formatDate, truncateWords, isAdmin, getUserFromStorage } from '../utils';
```

### Import all hooks
```tsx
import { useDebounce, usePagination } from '../hooks';
```

### Import all components
```tsx
import { 
  Pagination, 
  PageSizeSelector, 
  SearchInput, 
  LoadingSpinner,
  TagList,
  showDeleteConfirmation 
} from '../components';
```

## 🔄 Migration Benefits

### Before (Duplicated Code)
- Date formatting logic repeated in 3+ components
- Image URL construction duplicated across components
- User role checking logic scattered
- Pagination logic duplicated in Home and Dashboard
- Delete confirmation dialogs repeated
- Loading spinners inconsistent

### After (Reusable Code)
- Single source of truth for all utilities
- Consistent behavior across components
- Easier maintenance and updates
- Reduced bundle size through code reuse
- Better type safety with TypeScript interfaces
- Centralized styling and behavior

## 🚀 Usage Examples

### Updated BlogCard Component
```tsx
import { formatDate, truncateWords, isAdmin, getUserFromStorage } from '../utils';
import { showDeleteConfirmation } from './DeleteConfirmation';
import TagList from './TagList';

// Much cleaner component with reusable utilities
const BlogCard = ({ blog }) => {
  const user = getUserFromStorage();
  const userIsAdmin = isAdmin(user);
  
  return (
    <div>
      <h2>{blog.title}</h2>
      <p>{truncateWords(blog.description, 50)}</p>
      <TagList tags={blog.tags} />
      <span>{formatDate(blog.createdAt)}</span>
    </div>
  );
};
```

### Updated Home Component with Hooks
```tsx
import { useSearchDebounce, usePagination } from '../hooks';
import { Pagination, SearchInput, PageSizeSelector } from '../components';

const Home = () => {
  const { searchValue, setSearchValue } = useSearchDebounce(fetchBlogs, 2000);
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination(10);
  
  return (
    <div>
      <SearchInput value={searchValue} onChange={setSearchValue} />
      <PageSizeSelector pageSize={pageSize} onPageSizeChange={handlePageSizeChange} />
      <Pagination currentPage={currentPage} onPageChange={handlePageChange} />
    </div>
  );
};
```

## 📝 Best Practices

1. **Always use utility functions** instead of inline logic
2. **Import from index files** for cleaner imports
3. **Use TypeScript interfaces** for better type safety
4. **Keep components focused** on single responsibilities
5. **Test utilities independently** from components
6. **Document complex utilities** with JSDoc comments

## 🔧 Future Enhancements

- Add unit tests for all utilities
- Create more specialized hooks (useAuth, useBlogs, etc.)
- Add error boundary components
- Create form validation utilities
- Add internationalization utilities
- Create theme and styling utilities 