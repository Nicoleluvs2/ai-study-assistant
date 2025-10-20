document.getElementById('generate-summary')?.addEventListener('click', async () => {
    const text = document.getElementById('summary-text').value;
    if(!text) return alert('Please paste notes first.');

    const container = document.getElementById('summary-container');
    container.innerHTML = 'Generating summary...';

    try {
        const res = await fetch('/api/ai', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({mode:'summary', text})
        });
        const data = await res.json();

        container.innerHTML = data.summary || 'Failed to generate summary.';
    } catch(e) {
        console.error(e);
        container.innerHTML = 'Error generating summary.';
    }
});
