// --- Theme Toggle ---
const toggleBtn = document.getElementById('toggleTheme');
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// --- Units ---
let units = [];
let selectedUnit = null;

const newUnitInput = document.getElementById('newUnit');
const createUnitBtn = document.getElementById('createUnit');
const unitList = document.getElementById('unitList');

createUnitBtn.addEventListener('click', () => {
  const name = newUnitInput.value.trim();
  if (!name) return;
  const unit = { id: Date.now(), name, notes: [] };
  units.push(unit);
  selectedUnit = unit.id;
  newUnitInput.value = '';
  renderUnits();
});

function renderUnits() {
  unitList.innerHTML = '';
  units.forEach(u => {
    const li = document.createElement('li');
    li.textContent = `📦 ${u.name}`;
    li.addEventListener('click', () => selectedUnit = u.id);
    unitList.appendChild(li);
  });
}

// --- Notes ---
const noteText = document.getElementById('noteText');
const saveNoteBtn = document.getElementById('saveNote');
const notesContainer = document.getElementById('notesContainer');

saveNoteBtn.addEventListener('click', () => {
  if (!selectedUnit) return alert('Select a unit first!');
  const unit = units.find(u => u.id === selectedUnit);
  const note = { id: Date.now(), text: noteText.value };
  unit.notes.push(note);
  noteText.value = '';
  renderNotes();
});

function renderNotes() {
  notesContainer.innerHTML = '';
  const unit = units.find(u => u.id === selectedUnit);
  if (!unit) return;
  unit.notes.forEach(n => {
    const div = document.createElement('div');
    div.textContent = n.text;
    div.style.border = '1px solid #ccc';
    div.style.padding = '0.5rem';
    div.style.marginBottom = '0.25rem';
    div.style.borderRadius = '6px';
    notesContainer.appendChild(div);
  });
}

// --- Recording ---
let mediaRecorder;
let audioChunks = [];
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const audioPlayer = document.getElementById('audioPlayer');
const status = document.getElementById('status');

recordBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
    mediaRecorder.onstart = () => status.textContent = 'Recording... 🎤';
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      audioPlayer.src = URL.createObjectURL(blob);
      status.textContent = 'Recording stopped ⏹';
    };

    mediaRecorder.start();
  } catch (err) {
    console.error(err);
    alert('Microphone access denied or unsupported.');
  }
};

stopBtn.onclick = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
};

// --- AI Feature Stubs ---
document.getElementById('generateFlashcards').onclick = () => {
  alert('Flashcards would be generated here (stub).');
};

document.getElementById('summarizeNotes').onclick = () => {
  alert('Summaries would be generated here (stub).');
};
