const API_URL = "http://localhost:8000";

export async function checkBackendHealth() {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error("Backendr equest failed");
  }

  return response.json();
}