document.getElementById('solve-assignment')?.addEventListener('click', async () => {
    const fileInput = document.getElementById('assignment-file');
    if(!fileInput.files.length) return alert('Please select a file first.');

    const container = document.getElementById('assignment-container');
    container.innerHTML = 'Processing...';

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const res = await fetch('/api/ai', { method:'POST', body: formData });
        const data = await res.json();
        container.innerHTML = data.solution || 'Failed to solve assignment.';
    } catch(e) {
        console.error(e);
        container.innerHTML = 'Error processing assignment.';
    }
});
