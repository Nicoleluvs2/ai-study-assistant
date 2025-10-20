document.getElementById('generate-flashcards')?.addEventListener('click', async () => {
    const text = document.getElementById('flashcard-text').value;
    if(!text) return alert('Please paste your notes first.');

    const container = document.getElementById('flashcards-container');
    container.innerHTML = 'Generating flashcards...';

    try {
        const res = await fetch('/api/ai', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({mode:'flashcards', text})
        });
        const data = await res.json();
        container.innerHTML = '';
        if(Array.isArray(data.cards)){
            data.cards.forEach(c => {
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `<b>Q:</b> ${c.q} <br> <b>A:</b> ${c.a}`;
                container.appendChild(div);
            });
        } else {p
            container.innerHTML = 'Failed to generate flashcards.';
        }
    } catch(e) {
        console.error(e);
        container.innerHTML = 'Error generating flashcards.';
    }
});
