import React, { useEffect, useRef, useState } from "react";
import OfflineLoader from "./OfflineLoader";
import { transcribeOnline, summarizeOnline } from "./onlineAPI";

const DB = {
  get: async (key) => { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; },
  set: async (key, val) => localStorage.setItem(key, JSON.stringify(val)),
};

export default function App() {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [notesInput, setNotesInput] = useState("");
  const [offlineReady, setOfflineReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("");
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    (async () => {
      const saved = await DB.get("study_units");
      if (saved) { setUnits(saved); setSelectedUnit(saved[0]?.id ?? null); }
    })();
  }, []);

  useEffect(() => { DB.set("study_units", units); }, [units]);

  function createUnit(name) {
    const u = { id: `unit_${Date.now()}`, name, notes: [] };
    setUnits(prev => [u, ...prev]);
    setSelectedUnit(u.id);
  }

  function addNote(unitId, title, text, source="manual") {
    const note = { id: `note_${Date.now()}`, title, text, source, createdAt: new Date().toISOString() };
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, notes: [note, ...u.notes] } : u));
  }

  // --- Recording + Offline/Online transcription ---
  async function startRecording() {
    setStatus("Recording...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      mr.ondataavailable = e => { if(e.data.size>0) recordedChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        setStatus("Transcribing...");
        let text = "";
        if (navigator.onLine) {
          text = await transcribeOnline(blob) || await window.OfflineTranscriber.transcribe(blob);
        } else {
          text = await window.OfflineTranscriber.transcribe(blob);
        }
        addNote(selectedUnit, `Recording ${new Date().toLocaleTimeString()}`, text, "recording");
        setStatus("Transcription complete!");
      };

      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch(e) { console.error(e); setStatus("Recording failed."); }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current = null;
    }
    setRecording(false);
  }

  // --- TTS / Podcast ---
  const [voices, setVoices] = useState([]);
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length > 0 && !voice) setVoice(v[0].name);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [voice]);

  function speak(text) {
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    const chosen = voices.find(v => v.name === voice);
    if (chosen) u.voice = chosen;
    window.speechSynthesis.speak(u);
  }

  if(!offlineReady) return <OfflineLoader onReady={()=>setOfflineReady(true)} />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧠 AI Study Companion</h1>
      {/* Unit creation, notes, recording, TTS same as previous */}
    </div>
  );
  }
