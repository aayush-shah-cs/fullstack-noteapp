require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

const Note = require('./model/model');

app.use(cors());
app.use(express.json());
app.post('/notes', async (req,res)=>{
    const note = await Note.create(req.body);
    res.json(note);
});

app.get('/notes', async (req,res)=>{
    const notes = await Note.find();
    res.json(notes);
})

app.delete('/notes/:id', async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);

    res.json({
        message: "Deleted"
    });
});

app.put('/notes/:id', async (req, res) => {
    const updated = await Note.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updated);
});
app.post('/ai-note', async (req, res) => {
  const { transcript } = req.body;

  if (!transcript) return res.status(400).json({ error: 'No transcript provided' });

  const prompt = `
You are a smart note-taking assistant. Convert the following rough voice transcript into a clean, structured note.

Rules:
- Generate a short, smart title (max 5 words)
- Organize the content clearly
- Use bullet points (starting with "- ") when there are multiple tasks or items
- Fix grammar and spelling
- Keep it concise and readable
- Respond ONLY with valid JSON, no markdown, no extra text

Transcript: "${transcript}"

Respond in this exact format:
{"title": "...", "body": "..."}
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const rawText = response.data.candidates[0].content.parts[0].text.trim();
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (err) {
    console.error('Gemini error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Gemini API failed' });
  }
});

module.exports = app;