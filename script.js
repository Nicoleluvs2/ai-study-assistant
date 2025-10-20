let units = [];
let selectedUnitId = null;
let notesData = {};
let recording = false;
let mediaRecorder;
let recordedChunks = [];

const unitList = document.getElementById("unitList");
const notesList = document.getElementById("notesList");
const status = document.getElementById("status");

// --- Theme toggle ---
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// --- Create Unit ---
document.getElementById("createUnit").addEventListener("click", () => {
  const name = document.getElementById("newUnit").value.trim();
  if (!name) return;
  const id = `unit_${Date.now()}`;
  units.push({ id, name });
  notesData[id] = [];
  selectedUnitId = id;
  renderUnits();
  renderNotes();
  document.getElementById("newUnit").value = "";
});

// --- Render Units ---
function renderUnits() {
  unitList.innerHTML = "";
  units.forEach(u => {
    const li = document.createElement("li");
    li.textContent = u.name;
    li.onclick = () => {
      selectedUnitId = u.id;
      renderNotes();
    };
    if (u.id === selectedUnitId) li.style.fontWeight = "bold";
    unitList.appendChild(li);
  });
}

// --- Save Note ---
document.getElementById("saveNote").addEventListener("click", () => {
  const text = document.getElementById("noteInput").value.trim();
  if (!text || !selectedUnitId) {
    status.textContent = "Select a unit and add text!";
    return;
  }
  notesData[selectedUnitId].push({ id: Date.now(), text });
  renderNotes();
  document.getElementById("noteInput").value = "";
  status.textContent = "Note saved!";
});

// --- Render Notes ---
function renderNotes() {
  notesList.innerHTML = "";
  if (!selectedUnitId) return;
  notesData[selectedUnitId].forEach(n => {
    const li = document.createElement("li");
    li.textContent = n.text.slice(0, 100) + (n.text.length > 100 ? "..." : "");
    
    const listenBtn = document.createElement("button");
    listenBtn.textContent = "🔊 Listen";
    listenBtn.onclick = () => speak(n.text);

    const flashBtn = document.createElement("button");
    flashBtn.textContent = "🃏 Flashcards";
    flashBtn.onclick = () => generateFlashcards(n.text);

    const sumBtn = document.createElement("button");
    sumBtn.textContent = "📝 Summarize";
    sumBtn.onclick = () => summarizeNote(n.text);

    li.appendChild(listenBtn);
    li.appendChild(flashBtn);
    li.appendChild(sumBtn);
    notesList.appendChild(li);
  });
}

// --- TTS ---
function speak(text) {
  if (!text) return;
  const utter = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utter);
}

// --- Flashcard Stub ---
function generateFlashcards(text) {
  alert("Flashcards generated for text:\n" + text.slice(0, 100) + "...");
}

// --- Summarize Stub ---
function summarizeNote(text) {
  alert("Summary:\n" + text.slice(0, 100) + "...");
}

// --- Podcast Stub ---
document.getElementById("startPodcast").addEventListener("click", () => {
  if (!selectedUnitId) return alert("Select a unit first!");
  const notes = notesData[selectedUnitId].map(n => n.text).join(". ");
  speak("🎙 Podcast Mode: " + notes);
});

// --- File Upload Stubs ---
document.getElementById("pdfUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) status.textContent = "PDF uploaded (stub) ✔️";
});

document.getElementById("audioUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) status.textContent = "Audio uploaded (stub) ✔️";
});

document.getElementById("youtubeFetch").addEventListener("click", () => {
  const url = document.getElementById("youtubeURL").value.trim();
  if (!url) return;
  status.textContent = "YouTube fetched (stub) ✔️";
});

// --- Record Audio Stub ---
document.getElementById("recordAudio").addEventListener("click", async () => {
  if
