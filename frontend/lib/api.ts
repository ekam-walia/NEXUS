const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


export async function uploadPDF(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/api/v1/sources/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Failed to upload PDF"
    );
  }

  return response.json();
}