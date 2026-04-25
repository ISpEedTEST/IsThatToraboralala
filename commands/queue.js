const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    name: "queue",
    description: "📋 عرض قائمة الانتظار الحالية بتنسيق مرتب",
    async execute(interaction, client) {
        const serverQueue = client.guildData.get(interaction.guildId);
        
        if (!serverQueue || serverQueue.queue.length === 0) {
            return interaction.reply({ 
                embeds: [new EmbedBuilder().setColor("#2b2d31").setDescription("📭 **القائمة فارغة حالياً.**")], 
                flags: MessageFlags.Ephemeral 
            });
        }

        const list = serverQueue.queue.map((t, i) => {
            if (i === 0) return `**▶️ الان |** \`${t.title}\``;
            return `**${i}.** ${t.title}`;
        }).slice(0, 15).join("\n\n"); // عرض أول 15 مقطع فقط لتجنب طول الرسالة

        const queueEmbed = new EmbedBuilder()
            .setColor("#9b59b6")
            .setAuthor({ name: `قائمة الانتظار لسيرفر: ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
            .setDescription(`>>> ${list}`)
            .setFooter({ text: `إجمالي المقاطع: ${serverQueue.queue.length}` });

        return interaction.reply({ embeds: [queueEmbed] });
    }
};