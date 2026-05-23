require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/database/db');

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
});