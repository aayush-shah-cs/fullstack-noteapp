const express = require('express');
const cors = require('cors');

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

module.exports = app;