let mediaRecorder, audioChunks = [];

const startBtn = document.getElementById('start-recording');
const stopBtn = document.getElementById('stop-recording');
const container = document.getElementById('transcription-container');

startBtn?.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.addEventListener('dataavailable', e => audioChunks.push(e.data));
    mediaRecorder.start();
    container.innerHTML = 'Recording...';
});

stopBtn?.addEventListener('click', async () => {
    mediaRecorder.stop();
    mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks);
        const formData = new FormData();
        formData.append('file', audioBlob);

        container.innerHTML = 'Transcribing...';

        try {
            const res = await fetch('/api/ai', { method:'POST', body: formData });
            const data = await res.json();
            container.innerHTML = data.transcription || 'Failed to transcribe.';
        } catch(e) {
            console.error(e);
            container.innerHTML = 'Error transcribing.';
        }
    });
});
