const mongoose = require('mongoose');
async function connectDB(){
    await mongoose.connect("mongodb+srv://aayush:aayushCohort@8hourbackendclustor.3qc2idj.mongodb.net/NoteFull");
    console.log("connected to database");
}

module.exports = connectDB