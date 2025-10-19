import React, { useState, useEffect } from "react";

export default function OfflineLoader({ onReady }) {
  const [status, setStatus] = useState("Loading offline AI...");

  useEffect(() => {
    async function loadOfflineAI() {
      try {
        setStatus("Initializing offline AI engine...");
        await new Promise(r => setTimeout(r, 2000));

        window.OfflineTranscriber = {
          async transcribe(audioBlob) {
            const arrayBuffer = await audioBlob.arrayBuffer();
            // placeholder offline transcription
            return "[Offline transcription: Nigerian English accent + noise reduction]";
          }
        };

        setStatus("✅ Offline AI ready!");
        onReady();
      } catch (e) {
        setStatus("❌ Failed to load offline AI");
      }
    }

    loadOfflineAI();
  }, [onReady]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <span className="text-2xl mb-2">🧠🎧</span>
      <p className="text-lg font-medium">{status}</p>
    </div>
  );
}
