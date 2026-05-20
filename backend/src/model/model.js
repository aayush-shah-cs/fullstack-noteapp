const mongoose = require('mongoose');

const noteSchema =  new mongoose.Schema({
    title : String,
    body : String,
    color : String,
    folderId : String,
    pinned : Boolean,
    archived : Boolean,
    trashed : Boolean,
    created : Date
})

const noteModel = mongoose.model("NoteFull",noteSchema);

module.exports = noteModel;