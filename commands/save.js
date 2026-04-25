const { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");
const https = require("https");
const { getDb, saveToDb } = require("../utils/dbManager");

module.exports = {
    name: "save",
    description: "💾 حفظ مقطع جديد في مكتبتك",
    options: [
        { name: "name", type: ApplicationCommandOptionType.String, description: "اسم المقطع", required: true },
        { name: "file", type: ApplicationCommandOptionType.Attachment, description: "ارفع الملف الصوتي", required: true },
    ],
    async execute(interaction) {
        const name = interaction.options.getString("name").trim();
        const attachment = interaction.options.getAttachment("file");
        
        if (!attachment.contentType?.startsWith("audio/")) return interaction.reply({ content: "❌ الرجاء رفع ملف صوتي صالح.", flags: MessageFlags.Ephemeral });

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        // المسار الخاص بالمقاطع المحفوظة
        const audioDirectory = path.join(__dirname, "..", "saved_audio");
        if (!fs.existsSync(audioDirectory)) fs.mkdirSync(audioDirectory, { recursive: true });
        
        const filePath = path.join(audioDirectory, `${interaction.user.id}_${Date.now()}.mp3`);
        const fileStream = fs.createWriteStream(filePath);

        https.get(attachment.url, (res) => {
            res.pipe(fileStream);
            fileStream.on("finish", async () => {
                const db = getDb();
                if (!db[interaction.user.id]) db[interaction.user.id] = [];
                db[interaction.user.id].push({ name: name, path: filePath });
                saveToDb(db);
                
                const successEmbed = new EmbedBuilder()
                    .setColor("#2ecc71")
                    .setDescription(`✅ تم حفظ المقطع بنجاح باسم: **${name}**\nللشغيل: \`/play saved_name:${name}\``);
                await interaction.editReply({ embeds: [successEmbed] });
            });
        }).on("error", () => interaction.editReply("❌ حدث خطأ أثناء تحميل الملف."));
    }
};