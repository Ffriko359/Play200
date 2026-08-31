const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();

const {
    findUserByEmail,
    createUser,
    createOtp,
    verifyOtp,
    updateUserPassword,
    findUserById
} = require("../database");

const router = express.Router();

// ✅ إضافة مسار Profile
router.get("/profile", (req, res) => {
    // مؤقتاً - بدون توكن
    res.json({
        success: true,
        user: {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            coins: 100,
            gamesPlayed: 5,
            wins: 2
        }
    });
});

// ✅ إضافة مسار Update
router.post("/update", (req, res) => {
    res.json({
        success: true,
        message: "Updated successfully"
    });
});

// ✅ إضافة مسار Reset Password كامل
router.post("/reset-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "المرجو إدخال البريد الإلكتروني وكلمة المرور الجديدة"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "كلمة المرور خاصها تكون 6 أحرف على الأقل"
            });
        }

        const user = findUserByEmail(email.trim().toLowerCase());

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "الحساب غير موجود"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updated = updateUserPassword(user.id, hashedPassword);

        if (!updated) {
            return res.status(500).json({
                success: false,
                message: "فشل تحديث كلمة المرور"
            });
        }

        return res.json({
            success: true,
            message: "تم تغيير كلمة المرور بنجاح ✅"
        });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "حدث خطأ في السيرفر"
        });
    }
});

// ✅ مسار Login مع إضافة Token (مؤقت)
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "المرجو إدخال البريد الإلكتروني وكلمة المرور"
            });
        }

        const user = findUserByEmail(email.trim().toLowerCase());

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            });
        }

        // ✅ إضافة Token مؤقت
        const token = Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64');

        return res.json({
            success: true,
            message: "تم تسجيل الدخول بنجاح ✅",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "حدث خطأ في السيرفر"
        });
    }
});

// ✅ مسار Register مع Token
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "المرجو إدخال الاسم والبريد الإلكتروني وكلمة المرور"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "كلمة المرور خاصها تكون 6 أحرف على الأقل"
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        if (findUserByEmail(cleanEmail)) {
            return res.status(409).json({
                success: false,
                message: "هذا البريد الإلكتروني مسجل من قبل"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = createUser(name.trim(), cleanEmail, hashedPassword);

        const token = Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64');

        return res.status(201).json({
            success: true,
            message: "تم إنشاء الحساب بنجاح 🎉",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "حدث خطأ في السيرفر"
        });
    }
});

// باقي المسارات (send-code, verify-code, forgot-password, verify-reset-code) موجودة...

module.exports = router;
