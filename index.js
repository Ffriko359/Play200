
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

// ✅ Middleware محسّن
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Frontend
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index23.html"));
});

// ✅ Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "API is working 🔥",
        status: "online"
    });
});

// ✅ Auth routes
app.use("/api/auth", authRoutes);

// ✅ Test POST
app.post("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "POST API is working ✅",
        received: req.body
    });
});

// ✅ 404 - محسّن
app.use((req, res) => {
    console.log(`❌ Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// ✅ Error handler
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);
    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 CODE ⚡ LAB Backend running on port ${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api`);
});
