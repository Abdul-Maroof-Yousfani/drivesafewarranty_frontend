const getLocalApiBase = () => {
  if (typeof window !== "undefined") {
     return `http://${window.location.hostname}:3004/api`;
  }
  return "http://localhost:3004/api";
};

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || getLocalApiBase()
).replace(/\/+$/, "");

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};
  