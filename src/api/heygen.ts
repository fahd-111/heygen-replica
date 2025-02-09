const HEYGEN_API_KEY = import.meta.env.VITE_HEYGEN_API_KEY;

export async function createStreamingToken(): Promise<string> {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }

    const res = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: {
        "x-api-key": HEYGEN_API_KEY,
      },
    });

    const data = await res.json();
    return data.data.token;
  } catch (error) {
    console.error("Error retrieving access token:", error);
    throw new Error("Failed to retrieve access token");
  }
}