const app = require('./src/app');
const connectDB = require('./src/database/db');
connectDB();

app.listen(3000,()=>{
    console.log("running on port 3000");
})