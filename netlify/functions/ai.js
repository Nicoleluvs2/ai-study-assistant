// netlify/functions/ai.js
// Handles AI tasks: flashcards, summaries, assignment solving

const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  try {
    // Only POST allowed
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { mode, text } = JSON.parse(event.body);

    if (!mode || !text) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing mode or text' }) };
    }

    // Replace this with your OpenAI API key or Eleven Labs if needed
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    let prompt = '';
    switch (mode) {
      case 'flashcards':
        prompt = `Create detailed study flashcards (Q&A) from the following content:\n\n${text}`;
        break;
      case 'summary':
        prompt = `Summarize this text in a detailed, structured, easy-to-review format:\n\n${text}`;
        break;
      case 'assignment':
        prompt = `Solve the following assignment question(s) step by step:\n\n${text}`;
        break;
      default:
        prompt = text;
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // or 'gpt-4' if you have access
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content || '';

    // For flashcards, try to parse Q&A
    if (mode === 'flashcards') {
      // Split into cards based on Q: / A: patterns
      const cards = [];
      const lines = output.split(/\n+/);
      let currentCard = {};
      for (let line of lines) {
        if (/^Q:/.test(line)) {
          if (currentCard.q) cards.push(currentCard);
          currentCard = { q: line.replace(/^Q:\s*/, ''), a: '' };
        } else if (/^A:/.test(line)) {
          currentCard.a = line.replace(/^A:\s*/, '');
        } else if (currentCard.a) {
          currentCard.a += '\n' + line;
        }
      }
      if (currentCard.q) cards.push(currentCard);

      return {
        statusCode: 200,
        body: JSON.stringify({ cards })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ text: output })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'AI request failed', details: err.message })
    };
  }
};
