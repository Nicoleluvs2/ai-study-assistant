export async function transcribeOnline(audioBlob) {
  if (!navigator.onLine) return null;

  try {
    const formData = new FormData();
    formData.append("file", audioBlob);
    const res = await fetch("/api/transcribe", { method: "POST", body: formData });
    const data = await res.json();
    return data.text || "";
  } catch(e) {
    console.error("Online transcription failed", e);
    return null;
  }
}

export async function summarizeOnline(text) {
  if (!navigator.onLine) return null;

  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "summary", text })
    });
    const data = await res.json();
    return data.text || null;
  } catch(e) {
    console.error("Online summary failed", e);
    return null;
  }
}
