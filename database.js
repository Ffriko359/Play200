
const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "data.json");

let db = {
    users: [],
    otp_codes: []
};

if (fs.existsSync(DB_FILE)) {
    try {
        db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch (error) {
        console.log("⚠️ Creating new database...");
    }
}

function save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function findUserByEmail(email) {
    return db.users.find(
        user => user.email.toLowerCase() === email.toLowerCase()
    );
}

function findUserById(id) {
    return db.users.find(user => user.id === id);
}

function createUser(name, email, password) {
    const user = {
        id: db.users.length + 1,
        name,
        email,
        password,
        coins: 0,
        gamesPlayed: 0,
        wins: 0,
        created_at: new Date().toISOString()
    };

    db.users.push(user);
    save();
    return user;
}

function createOtp(userId, code, expiresAt) {
    const otp = {
        id: db.otp_codes.length + 1,
        user_id: userId,
        code,
        expires_at: expiresAt,
        verified: 0
    };

    db.otp_codes.push(otp);
    save();
    return otp;
}

function verifyOtp(userId, code) {
    const otp = db.otp_codes.find(
        item =>
            item.user_id === userId &&
            item.code === code &&
            item.verified === 0
    );

    if (!otp) return false;
    if (Date.now() > otp.expires_at) return false;

    otp.verified = 1;
    save();
    return true;
}

// ✅ إضافة هذه الدالة
function updateUserPassword(userId, hashedPassword) {
    const user = db.users.find(user => user.id === userId);

    if (!user) return false;

    user.password = hashedPassword;
    save();
    return true;
}

console.log("✅ CODE⚡LAB Database initialized successfully");

module.exports = {
    db,
    save,
    findUserByEmail,
    findUserById,
    createUser,
    createOtp,
    verifyOtp,
    updateUserPassword
};
