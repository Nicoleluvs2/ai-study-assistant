import React, { useEffect, useRef, useState } from "react";
import './App.css'; // custom styling if needed

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [notes, setNotes] = useState("");
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [status, setStatus] = useState("");
  const [availableVoices, setAvailableVoices] = useState([]);
  const [voice, setVoice] = useState(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Load voices & units
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setAvailableVoices(v);
      if (v.length > 0 && !voice) setVoice(v[0].name);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    const saved = localStorage.getItem('study_units');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUnits(parsed);
      setSelectedUnit(parsed[0]?.id ?? null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('study_units', JSON.stringify(units));
  }, [units]);

  // --- Unit & note management ---
  function createUnit(name) {
    const u = { id: `unit_${Date.now()}`, name, notes: [] };
    setUnits((s) => [u, ...s]);
    setSelectedUnit(u.id);
  }

  function addNoteToUnit(unitId, title, text, source = 'paste') {
    const note = { id: `note_${Date.now()}`, title, text, source, createdAt: new Date().toISOString() };
    setUnits((prev) => prev.map(u => u.id === unitId ? { ...u, notes: [note, ...u.notes] } : u));
  }

  // --- TTS ---
  function speak(text) {
    if (!text) return;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const chosen = availableVoices.find(v => v.name === voice);
      if (chosen) u.voice = chosen;
      window.speechSynthesis.speak(u);
    } else alert('SpeechSynthesis not supported in this browser.');
  }

  // --- Recording ---
  async function startRecording() {
    setStatus('Starting recording...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const unitId = selectedUnit || units[0]?.id;
        if (!unitId) { setStatus('Select a unit first'); return; }
        addNoteToUnit(unitId, `Recording ${new Date().toLocaleString()}`, 'Audio saved — transcribing...', 'recording');
        await handleAudioUpload(blob, unitId, true);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
      setStatus('Recording...');
    } catch (err) {
      console.error(err);
      setStatus('Recording failed.');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current = null;
    }
    setRecording(false);
  }

  // --- Offline / Online Audio Transcription ---
  async function handleAudioUpload(file, unitId, offlinePreferred = true) {
    setStatus('Transcribing audio...');
    try {
      if (offlinePreferred && window.OfflineTranscriber) {
        setStatus('Using offline transcriber...');
        const result = await window.OfflineTranscriber(file);
        addNoteToUnit(unitId, file.name, result.text || '');
        setStatus('Offline transcription complete.');
        return;
      }
      // online fallback
      const fd = new FormData();
      fd.append('file', file);
      fd.append('source', 'audio');
      const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
      const data = await res.json();
      addNoteToUnit(unitId, file.name, data.text || '');
      setStatus('Online transcription complete.');
    } catch (err) {
      console.error(err);
      setStatus('Transcription failed.');
    }
  }

  // --- Light/Dark mode toggle ---
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // --- Export / Import ---
  function exportUnit(unitId) {
    const u = units.find(x => x.id === unitId);
    if (!u) return;
    const blob = new Blob([JSON.stringify(u, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${u.name}.study.json`; a.click(); URL.revokeObjectURL(url);
  }

  async function importUnit(file) {
    const text = await file.text();
    try {
      const obj = JSON.parse(text);
      obj.id = `unit_${Date.now()}`;
      setUnits((s) => [obj, ...s]);
      setStatus('Unit imported.');
    } catch (err) { setStatus('Import failed.'); }
  }

  // --- UI render ---
  return (
    <div className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-purple-50 text-gray-900'} min-h-screen font-sans`}>
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg">
        <h1 className="text-xl font-bold">📚 AI Study Companion</h1>
        <button onClick={toggleDarkMode} className="px-3 py-1 rounded bg-white text-purple-700 font-semibold">{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
      </header>

      <main className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar - Units */}
        <aside className="md:col-span-1 bg-purple-100 dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-2">🗂️ Units</h2>
          <input placeholder="New unit name" id="newUnit" className="w-full rounded p-2 border" />
          <div className="flex gap-2 mt-2">
            <button className="px-3 py-2 rounded bg-purple-600 text-white" onClick={() => {
              const el = document.getElementById('newUnit'); if(el?.value?.trim()) { createUnit(el.value.trim()); el.value=''; }
            }}>➕ Create</button>
            <button className="px-3 py-2 rounded border" onClick={() => { const el=document.getElementById('newUnit'); el.value=''; }}>Clear</button>
          </div>

          <ul className="mt-4 space-y-2 max-h-64 overflow-auto">
            {units.map(u => (
              <li key={u.id} className={`p-2 rounded cursor-pointer ${selectedUnit===u.id ? 'bg-purple-300 dark:bg-purple-700' : 'hover:bg-purple-200 dark:hover:bg-purple-600'}`} onClick={() => setSelectedUnit(u.id)}>
                <div className="font-medium">{u.name}</div>
                <div className="text-xs">{u.notes.length} notes</div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Section */}
        <section className="md:col-span-3 space-y-4">
          {/* Capture & Upload */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
            <h3 className="font-semibold mb-2">📝 Capture & Upload</h3>
            <textarea rows={4} value={notes} onChange={(e)=>setNotes(e.target.value)} className="w-full p-2 rounded border mb-2" placeholder="Paste lecture notes or copy text here..." />
            <div className="flex gap-2 mb-2">
              <button className="px-3 py-1 rounded bg-purple-600 text-white" onClick={()=>selectedUnit ? addNoteToUnit(selectedUnit,'Pasted
