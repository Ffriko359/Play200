const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "API is working 🔥",
        status: "online"
    });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Test POST
app.post("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "POST API is working ✅",
        received: req.body
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`CODE ⚡ LAB Backend running on port ${PORT}`);
});
