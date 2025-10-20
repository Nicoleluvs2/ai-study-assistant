document.getElementById('generate-podcast')?.addEventListener('click', async () => {
    const text = document.getElementById('podcast-text').value;
    const unit = document.getElementById('podcast-unit').value;
    if(!text) return alert('Please paste notes first.');

    const container = document.getElementById('podcast-container');
    container.innerHTML = 'Generating podcast...';

    try {
        const res = await fetch('/api/ai', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({mode:'podcast', text, unit})
        });
        const data = await res.json();

        if(data.audioUrl){
            container.innerHTML = `<audio controls src="${data.audioUrl}"></audio>`;
        } else {
            container.innerHTML = 'Failed to generate podcast.';
        }
    } catch(e) {
        console.error(e);
        container.innerHTML = 'Error generating podcast.';
    }
});
