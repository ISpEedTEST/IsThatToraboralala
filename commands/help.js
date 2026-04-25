const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    name: "help",
    description: "🛠️ عرض قائمة الأوامر بتصميم أنيق",
    async execute(interaction, client) {
        const helpEmbed = new EmbedBuilder()
            .setColor("#FFD700") // لون ذهبي فخم
            .setAuthor({ name: "دليل أوامر البوت الصوتي", iconURL: client.user.displayAvatarURL() })
            .setDescription(">>> إليك قائمة بجميع الأوامر المتاحة للتحكم بالصوتيات ومكتبتك الخاصة. استخدم الأوامر المائلة (`/`) للتفاعل.")
            .addFields(
                { name: "▶️ أوامر التشغيل", value: "`play` - تشغيل مقطع\n`playall` - تشغيل كل مكتبتك\n`stop` - إنهاء ومغادرة الروم", inline: false },
                { name: "📁 إدارة المكتبة", value: "`mylibrary` - عرض مكتبتك\n`save` - حفظ مقطع جديد\n`delete` - حذف مقطع\n`share` - مشاركة مقطع", inline: false },
                { name: "🎛️ التحكم بالقائمة", value: "`queue` - عرض الطابور\n`skip` - تخطي المقطع\n`loop` - تفعيل/إلغاء التكرار", inline: false }
            )
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/4348/4348057.png")
            .setFooter({ text: `مرحباً بك يا ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        return interaction.reply({ embeds: [helpEmbed], flags: MessageFlags.Ephemeral });
    }
};