const API_URL = "https://threadly-server.vercel.app/api";

export const searchAll = async (query) => {
  const response = await fetch(
    `${API_URL}/search?q=${encodeURIComponent(query)}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Search failed"
    );
  }

  return data;
};
