require("dotenv").config()

const app = require("./src/app")
const connectToDB = require("./src/config/db")

connectToDB()

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})

// require("dotenv").config();

// console.log("MONGO_URI loaded:", process.env.MONGO_URI ? "YES" : "NO");

// const app = require("./src/app");
// const connectToDB = require("./src/config/db");

// connectToDB();

// app.listen(3000, () => {
//     console.log("Server is running on port 3000");
// });