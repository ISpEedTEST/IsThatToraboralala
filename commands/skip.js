const { MessageFlags } = require("discord.js");

module.exports = {
    name: "skip",
    description: "⏭️ تخطي المقطع الحالي للذي يليه",
    async execute(interaction, client) {
        const serverQueue = client.guildData.get(interaction.guildId);
        if (!serverQueue || !serverQueue.player) {
            return interaction.reply({ content: "❌ لا يوجد مقطع يعمل لتخطيه.", flags: MessageFlags.Ephemeral });
        }
        
        serverQueue.skipRequested = true; 
        serverQueue.player.stop(); // إيقاف المشغل سيؤدي تلقائياً إلى تشغيل حدث Idle والانتقال للتالي
        
        return interaction.reply({ content: "⏭️ تم التخطي بنجاح!", flags: MessageFlags.Ephemeral });
    }
};