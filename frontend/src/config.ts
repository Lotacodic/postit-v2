// Fail fast at startup rather than with a cryptic network error at runtime.
const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error(
    "VITE_API_URL is not set. Create a frontend/.env file with VITE_API_URL=<your api url>."
  );
}

export const API_URL = apiUrl as string;
