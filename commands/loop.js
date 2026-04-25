const { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    name: "loop",
    description: "🔄 تغيير وضع التكرار",
    options: [{
        name: "mode",
        type: ApplicationCommandOptionType.String,
        description: "اختر وضع التكرار",
        required: true,
        choices: [
            { name: "إيقاف التكرار ❌", value: "off" },
            { name: "تكرار المقطع الحالي 🔂", value: "track" },
            { name: "تكرار القائمة بالكامل 🔁", value: "queue" }
        ]
    }],
    async execute(interaction, client) {
        const serverQueue = client.guildData.get(interaction.guildId);
        if (!serverQueue) {
            return interaction.reply({ content: "❌ البوت لا يشغل شيئاً حالياً.", flags: MessageFlags.Ephemeral });
        }

        const mode = interaction.options.getString("mode");
        serverQueue.loopMode = mode;
        
        const modeNames = { off: "إيقاف التكرار ❌", track: "تكرار المقطع 🔂", queue: "تكرار القائمة 🔁" };
        
        const loopEmbed = new EmbedBuilder()
            .setColor("#3498db")
            .setDescription(`🔄 تم تغيير وضع التكرار إلى: **${modeNames[mode]}**`);
            
        return interaction.reply({ embeds: [loopEmbed] });
    }
};