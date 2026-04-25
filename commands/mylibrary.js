const { EmbedBuilder, MessageFlags } = require("discord.js");
const { getDb } = require("../utils/dbManager");

module.exports = {
    name: "mylibrary",
    description: "📁 عرض مكتبتك الصوتية الخاصة",
    async execute(interaction, client) {
        const db = getDb();
        const userFiles = db[interaction.user.id] || [];
        
        if (userFiles.length === 0) {
            return interaction.reply({ 
                content: "📭 مكتبتك فارغة تماماً! استخدم `/save` لرفع المقاطع.", 
                flags: MessageFlags.Ephemeral 
            });
        }
        
        const fileNames = userFiles.map((f, i) => {
            let item = `**${i + 1}.** 🎵 \`${f.name}\``;
            if (f.sharedBy) item += ` *(مشارك من: ${f.sharedBy})*`;
            return item;
        }).join("\n");

        const embed = new EmbedBuilder()
            .setColor("#00C9A7")
            .setAuthor({ name: "مكتبتك الصوتية السحابية", iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`>>> ${fileNames}`)
            .setFooter({ text: `عدد المقاطع المحفوظة: ${userFiles.length}` });

        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};