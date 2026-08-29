const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();

const {
    findUserByEmail,
    createUser,
    createOtp,
    verifyOtp
} = require("../database");

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

        const user = createUser(
            name.trim(),
            cleanEmail,
            hashedPassword
        );

        return res.status(201).json({
            success: true,
            message: "تم إنشاء الحساب بنجاح 🎉",
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

router.post("/send-code", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "المرجو إدخال البريد الإلكتروني"
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = findUserByEmail(cleanEmail);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "الحساب غير موجود"
            });
        }

        const code = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const expiresAt = Date.now() + 10 * 60 * 1000;

        createOtp(user.id, code, expiresAt);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: cleanEmail,
            subject: "CODE ⚡ LAB - رمز التحقق",
            text: `مرحبا ${user.name},

رمز التحقق ديالك هو:

${code}

هذا الرمز صالح لمدة 10 دقائق.

CODE ⚡ LAB`
        });

        console.log(`EMAIL SENT TO: ${cleanEmail}`);

        return res.json({
            success: true,
            message: "تم إرسال رمز التحقق إلى البريد الإلكتروني 📧",
            expiresIn: 600
        });

    } catch (error) {
        console.error("SEND CODE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "فشل إرسال رمز التحقق"
        });
    }
});

router.post("/verify-code", (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: "المرجو إدخال البريد الإلكتروني ورمز التحقق"
            });
        }

        const user = findUserByEmail(
            email.trim().toLowerCase()
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "الحساب غير موجود"
            });
        }

        const valid = verifyOtp(
            user.id,
            code.toString()
        );

        if (!valid) {
            return res.status(400).json({
                success: false,
                message: "رمز التحقق غير صحيح أو منتهي الصلاحية"
            });
        }

        return res.json({
            success: true,
            message: "تم التحقق من الحساب بنجاح ✅",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("VERIFY CODE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "حدث خطأ في السيرفر"
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "المرجو إدخال البريد الإلكتروني وكلمة المرور"
            });
        }

        const user = findUserByEmail(
            email.trim().toLowerCase()
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            });
        }

        return res.json({
            success: true,
            message: "تم تسجيل الدخول بنجاح ✅",
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

module.exports = router;