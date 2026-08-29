const API_URL = "http://localhost:5000/api";

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
