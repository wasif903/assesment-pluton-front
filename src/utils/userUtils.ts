export interface User {
  _id: string;
  username: string;
  role: string | string[];
  email?: string;
}

export const getUserFromStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user from storage:", error);
    return null;
  }
};

export const isLoggedIn = (): boolean => {
  return !!getUserFromStorage();
};

export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return Array.isArray(user.role) ? user.role.includes("Admin") : user.role === "Admin";
};

export const isOwner = (user: User | null, blogCreatedBy: string): boolean => {
  if (!user) return false;
  return user._id === blogCreatedBy;
}; 