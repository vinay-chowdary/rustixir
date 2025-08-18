interface ShaderResponse {
  shader?: string;
  error?: string;
}

export async function fetchShader(prompt: string): Promise<ShaderResponse> {
  try {
    const res = await fetch("http://localhost:4000/shader", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const json = await res.json();
    return json;
  } catch (error) {
    return { error: "Failed to fetch shader" };
  }
}
