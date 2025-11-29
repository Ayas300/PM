require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth.routes");
const entryRoutes = require("./routes/entry.routes");

const app = express();
app.use(express.json());

// Add this simple test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/entries", entryRoutes);

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(process.env.PORT || 5000, () => console.log("Server running"));
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
