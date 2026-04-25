const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "database.json");

// التأكد من وجود الملف عند بدء التشغيل
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}));
}

module.exports = {
    getDb: () => {
        try {
            return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        } catch (e) {
            return {};
        }
    },
    saveToDb: (data) => {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    }
};