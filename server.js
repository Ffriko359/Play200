const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CODE ⚡ LAB Backend is running 🚀"
  });
});

// اختبار API
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is working 🔥",
    status: "online"
  });
});

// اختبار POST
app.post("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "POST API is working ✅",
    received: req.body
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`CODE ⚡ LAB Backend running on port ${PORT}`);
});
