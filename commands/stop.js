const { EmbedBuilder, MessageFlags } = require("discord.js");
const { updateBotStatus } = require("../utils/musicHelper");
module.exports = {
    name: "stop",
    description: "🛑 إيقاف التشغيل ومغادرة الروم الصوتية",
    async execute(interaction, client) {
        const serverQueue = client.guildData.get(interaction.guildId);
        if (!serverQueue) return interaction.reply({ content: "❌ البوت لا يشغل شيئاً حالياً.", flags: MessageFlags.Ephemeral });

        serverQueue.queue = [];
        if (serverQueue.originalLibrary) serverQueue.originalLibrary = [];
        
        serverQueue.player.stop();
        serverQueue.connection.destroy();
        client.guildData.delete(interaction.guildId);

        if (serverQueue.playingMessage) {
            const stopEmbed = new EmbedBuilder().setColor("#e74c3c").setTitle("🛑 تم إيقاف التشغيل");
            serverQueue.playingMessage.edit({ embeds: [stopEmbed], components: [] }).catch(()=>{});
        }
        updateBotStatus(false);
        return interaction.reply({ content: "🛑 تم إيقاف البوت ومغادرة الروم!", flags: MessageFlags.Ephemeral });
    }
};