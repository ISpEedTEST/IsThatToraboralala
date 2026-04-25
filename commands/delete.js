const { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const { getDb, saveToDb } = require('../utils/dbManager');

module.exports = {
    name: 'delete',
    description: '🗑️ حذف مقطع نهائياً من مكتبتك ومن وحدة التخزين',
    options: [{
        name: 'saved_name',
        type: ApplicationCommandOptionType.String,
        description: 'اختر اسم المقطع الذي تريد حذفه',
        required: true,
        autocomplete: true // تفعيل القائمة المنسدلة للبحث السهل
    }],
    async execute(interaction) {
        const savedName = interaction.options.getString('saved_name').trim();
        const db = getDb();
        const userFiles = db[interaction.user.id] || [];

        // البحث عن المقطع في قاعدة بيانات المستخدم
        const fileIndex = userFiles.findIndex(f => f.name.toLowerCase() === savedName.toLowerCase());

        if (fileIndex === -1) {
            return interaction.reply({
                content: `❌ لم أجد مقطعاً باسم "**${savedName}**" في مكتبتك.`,
                flags: MessageFlags.Ephemeral
            });
        }

        const fileData = userFiles[fileIndex];

        // 1. حذف الملف الفعلي من مجلد saved_audio
        try {
            if (fs.existsSync(fileData.path)) {
                fs.unlinkSync(fileData.path);
                console.log(`✅ تم حذف الملف بنجاح من المسار: ${fileData.path}`);
            } else {
                console.warn(`⚠️ الملف غير موجود فعلياً في المسار: ${fileData.path}`);
            }
        } catch (error) {
            console.error(`❌ خطأ أثناء محاولة حذف الملف من القرص: ${error.message}`);
            // ملاحظة: نواصل الحذف من قاعدة البيانات حتى لو فشل حذف الملف الفيزيائي 
            // لضمان عدم بقاء بيانات "ميتة" في القائمة.
        }

        // 2. حذف المقطع من مصفوفة بيانات المستخدم في database.json
        userFiles.splice(fileIndex, 1);
        db[interaction.user.id] = userFiles;
        saveToDb(db);

        // 3. واجهة تأكيد الحذف للمستخدم
        const embed = new EmbedBuilder()
            .setColor("#e74c3c")
            .setAuthor({ name: "تم الحذف النهائي", iconURL: "https://cdn-icons-png.flaticon.com/512/1214/1214428.png" })
            .setDescription(`>>> تم حذف المقطع **${fileData.name}** بالكامل.\n\n**تفاصيل العملية:**\n- تم إزالة البيانات من مكتبتك.\n- تم مسح الملف الصوتي من السيرفر.`)
            .setFooter({ text: `تم التنفيذ بواسطة: ${interaction.user.username}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};