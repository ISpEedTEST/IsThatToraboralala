// commands/dashboard.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    name: 'dashboard',
    description: '⚙️ فتح لوحة التحكم السحابية الخاصة بالبوت',
    async execute(interaction, client) {
        // يمكنك لاحقاً وضع الرابط في ملف .env ليصبح: process.env.DASHBOARD_URL
        const dashboardUrl = process.env.DASHBOARD_URL; // استبدله برابط موقعك الحقيقي

        const embed = new EmbedBuilder()
            .setColor("#5865F2") // لون ديسكورد الرسمي أو لون علامتك التجارية
            .setAuthor({ name: "لوحة التحكم المركزية", iconURL: client.user.displayAvatarURL() })
            .setDescription(">>> 🎛️ **تحكم كامل بإعدادات البوت ومكتبتك الصوتية!**\n\nمن خلال لوحة التحكم يمكنك:\n☁️ رفع وتنظيم مقاطعك الصوتية بسهولة.\n📋 إدارة طابور التشغيل الحي (Live Queue).\n⚙️ تخصيص إعدادات السيرفر الافتراضية.")
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/2097/2097325.png") // أيقونة تعبر عن الإعدادات أو لوحة التحكم
            .setFooter({ text: "نظام الإدارة السحابي", iconURL: interaction.user.displayAvatarURL() });

        // إنشاء زر تفاعلي ينقل المستخدم للموقع
        const linkButton = new ButtonBuilder()
            .setLabel('الذهاب إلى لوحة التحكم')
            .setURL(dashboardUrl)
            .setStyle(ButtonStyle.Link)
            .setEmoji('🌐');

        const row = new ActionRowBuilder().addComponents(linkButton);

        // جعلنا الرسالة Ephemeral لكي لا تزعج الدردشة العامة، وتظهر للشخص الذي طلبها فقط
        return interaction.reply({ 
            embeds: [embed], 
            components: [row], 
            flags: MessageFlags.Ephemeral 
        });
    }
};