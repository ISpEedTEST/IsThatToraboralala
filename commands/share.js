// commands/share.js
const { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } = require('discord.js');
const { getDb, saveToDb } = require('../utils/dbManager');

module.exports = {
    name: 'share',
    description: '🤝 مشاركة مقطع من مكتبتك مع شخص آخر',
    options: [
        { 
            name: "saved_name", 
            type: ApplicationCommandOptionType.String, 
            description: "اختر المقطع الذي تريد مشاركته من القائمة", 
            required: true,
            autocomplete: true // 👈 هذا السطر هو السحر الذي سيظهر القائمة!
        },
        { 
            name: "user", 
            type: ApplicationCommandOptionType.User, 
            description: "الشخص الذي تريد مشاركة المقطع معه", 
            required: true 
        }
    ],
    async execute(interaction, client) {
        const savedName = interaction.options.getString("saved_name").trim();
        const targetUser = interaction.options.getUser("user");
        const db = getDb();
        const myFiles = db[interaction.user.id] || [];

        // 1. التحقق من أن المقطع موجود في مكتبتك
        const fileToShare = myFiles.find(f => f.name.toLowerCase() === savedName.toLowerCase());
        if (!fileToShare) {
            return interaction.reply({ 
                content: `❌ لم أجد مقطعاً باسم "**${savedName}**" في مكتبتك. تأكد من اختياره من القائمة.`, 
                flags: MessageFlags.Ephemeral 
            });
        }

        // 2. منع الشخص من مشاركة الملف مع نفسه
        if (targetUser.id === interaction.user.id) {
            return interaction.reply({ content: "❌ لا يمكنك مشاركة مقطع مع نفسك!", flags: MessageFlags.Ephemeral });
        }

        // 3. إضافة المقطع لمكتبة الشخص الآخر
        if (!db[targetUser.id]) db[targetUser.id] = [];
        
        // التحقق مما إذا كان يمتلكه مسبقاً لمنع التكرار
        const alreadyHasIt = db[targetUser.id].some(f => f.name.toLowerCase() === fileToShare.name.toLowerCase());
        if (alreadyHasIt) {
            return interaction.reply({ content: `⚠️ **${targetUser.username}** يمتلك مقطعاً بهذا الاسم مسبقاً.`, flags: MessageFlags.Ephemeral });
        }

        // نسخ المرجعية فقط مع إضافة وسم (Shared by) لتمييزه
        db[targetUser.id].push({
            name: fileToShare.name,
            path: fileToShare.path,
            sharedBy: interaction.user.username 
        });
        
        saveToDb(db);

        // 4. إرسال واجهة جذابة تؤكد العملية
        const embed = new EmbedBuilder()
            .setColor("#00C9A7") // لون أخضر مريح
            .setAuthor({ name: "تمت المشاركة بنجاح! 🤝", iconURL: targetUser.displayAvatarURL() })
            .setDescription(`>>> تم منح **${targetUser.username}** صلاحية تشغيل المقطع:\n🎵 \`${fileToShare.name}\``)
            .setFooter({ text: `تمت المشاركة بواسطة: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};