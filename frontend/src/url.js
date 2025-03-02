export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
export const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:5000/uploads/";
export const URL = BACKEND_URL; // Make sure this is exported if used elsewhere
