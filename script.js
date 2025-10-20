// ======== VARIABLES ========
let units = [];
let selectedUnitId = null;
let recording = false;
let mediaRecorder;
let recordedChunks = [];

// ======== DOM ELEMENTS ========
const unitList = document.getElementById("unitList");
const newUnitInput = document.getElementById("newUnit");
const createUnitBtn = document.getElementById("createUnit");
const noteInput = document.getElementById("noteInput");
const saveNoteBtn = document.getElementById("saveNote");
const notesContainer = document.getElementById("notesContainer");
const recordBtn = document.getElementById("recordBtn");
const recordStatus = document.getElementById("recordStatus");
const playPodcastBtn = document.getElementById("playPodcast");
const themeToggle = document.getElementById("themeToggle");

// ======== THEME TOGGLE ========
themeToggle.onclick = () => document.body.classList.toggle("dark-mode");

// ======== UNIT FUNCTIONS ========
function createUnit(name) {
    if (!name) return;
    const unit = { id: Date.now(), name, notes: [] };
    units.push(unit);
    selectedUnitId = unit.id;
    renderUnits();
}

function renderUnits() {
    unitList.innerHTML = "";
    units.forEach(unit => {
        const li = document.createElement("li");
        li.textContent = `${unit.name} (${unit.notes.length})`;
        li.classList.toggle("selected", unit.id === selectedUnitId);
        li.onclick = () => { selectedUnitId = unit.id; renderUnits(); renderNotes(); };
        unitList.appendChild(li);
    });
}

// ======== NOTE FUNCTIONS ========
function saveNote() {
    if (!selectedUnitId || !noteInput.value.trim()) return;
    const unit = units.find(u => u.id === selectedUnitId);
    unit.notes.push({ id: Date.now(), text: noteInput.value });
    noteInput.value = "";
    renderNotes();
    renderUnits();
}

function renderNotes() {
    notesContainer.innerHTML = "";
    if (!selectedUnitId) return;
    const unit = units.find(u => u.id === selectedUnitId);
    unit.notes.forEach(note => {
        const div = document.createElement("div");
        div.textContent = note.text;
        div.style.padding = "0.5rem";
        div.style.marginBottom = "0.5rem";
        div.style.border = "1px solid #ccc";
        div.style.borderRadius = "5px";
        notesContainer.appendChild(div);
    });
}

// ======== RECORDING FUNCTIONS ========
async function toggleRecording() {
    if (!recording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: "audio/webm" });
            if (!selectedUnitId) return;
            const unit = units.find(u => u.id === selectedUnitId);
            unit.notes.push({ id: Date.now(), text: "[Audio Recording Placeholder] 🎤" });
            renderNotes();
        };
        mediaRecorder.start();
        recording = true;
        recordStatus.textContent = "Recording...";
        recordBtn.textContent = "Stop Recording";
    } else {
        mediaRecorder.stop();
        recording = false;
        recordStatus.textContent = "Idle";
        recordBtn.textContent = "Start Recording";
    }
}

// ======== PODCAST PLAYBACK ========
function playPodcast() {
    if (!selectedUnitId) return;
    const unit = units.find(u => u.id === selectedUnitId);
    const fullText = unit.notes.map(n => n.text).join(". ");
    const utterance = new SpeechSynthesisUtterance(fullText);
    speechSynthesis.speak(utterance);
}

// ======== EVENT LISTENERS ========
createUnitBtn.onclick = () => { createUnit(newUnitInput.value.trim()); newUnitInput.value = ""; };
saveNoteBtn.onclick = saveNote;
recordBtn.onclick = toggleRecording;
playPodcastBtn.onclick = playPodcast;

// ======== INITIALIZE ========
renderUnits();
renderNotes();
