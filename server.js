const express = require("express");
const app = express();

const cors = require("cors");

app.use(cors())
require('dotenv').config()

app.use(express.json());

// Connect to MongoDB
const connectionDB = require("./config/connectDB");
const PORT = process.env.PORT || 3000;
connectionDB();

// Routes
const recipeRoutes = require("./routes/recipe");
app.use("/recipes", recipeRoutes);

const userRoutes = require("./routes/usersRoute");
app.use("/users", userRoutes);




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});