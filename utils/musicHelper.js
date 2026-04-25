const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { createAudioResource } = require("@discordjs/voice");

function getControlButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("btn_pause_resume").setLabel("⏯️ إيقاف / إستكمال").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("btn_set_vol").setLabel("🎚️ ضبط الصوت").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("btn_skip").setLabel("⏭️ تخطي").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("btn_stop").setLabel("🛑 إنهاء").setStyle(ButtonStyle.Danger),
    );
}

// داخل utils/musicHelper.js
async function processQueue(client, guildId, isTrackLoop = false) {
    const serverQueue = client.guildData.get(guildId);
    if (!serverQueue) return;

    if (serverQueue.queue.length === 0) {
        const endEmbed = new EmbedBuilder()
            .setColor("#2b2d31") // لون ديسكورد الداكن المريح
            .setAuthor({ name: "انتهت القائمة", iconURL: "https://cdn-icons-png.flaticon.com/512/179/179288.png" })
            .setDescription(">>> 🛑 **لم يعد هناك مقاطع في قائمة الانتظار.**\nسأغادر الروم الصوتي الآن، شكراً لاستخدامك البوت!")
            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setTimestamp();
        
        if (serverQueue.playingMessage) {
            await serverQueue.playingMessage.edit({ embeds: [endEmbed], components: [] }).catch(() => {});
        }
        
        serverQueue.connection.destroy();
        client.guildData.delete(guildId);
        return;
    }

    const track = serverQueue.queue[0];

    try {
        const resource = createAudioResource(track.url, { inlineVolume: true });
        resource.volume.setVolume(serverQueue.volume);
        
        serverQueue.currentResource = resource;
        serverQueue.player.play(resource);

        if (!isTrackLoop) {
            const modeDisplay = serverQueue.loopMode === 'off' ? 'معطل ❌' : serverQueue.loopMode === 'track' ? 'المقطع 🔂' : 'القائمة 🔁';
            const volumeDisplay = `${Math.round(serverQueue.volume * 100)}%`;

            const playEmbed = new EmbedBuilder()
                .setColor("#5865F2") // لون ديسكورد المميز
                .setAuthor({ name: "جاري التشغيل الآن", iconURL: "https://cdn.discordapp.com/emojis/1040652875150827550.gif" }) // أيقونة متحركة (يمكنك تغييرها)
                .setTitle(`🎵 ${track.title}`)
                .setDescription(`>>> **المصدر:** ${track.type === 'local' ? '📁 مكتبة السيرفر' : '📎 مرفق مؤقت'}`)
                .addFields(
                    { name: "📊 الترتيب", value: `\`1 / ${serverQueue.queue.length}\``, inline: true },
                    { name: "🎚️ الصوت", value: `\`${volumeDisplay}\``, inline: true },
                    { name: "🔄 التكرار", value: `\`${modeDisplay}\``, inline: true }
                )
                .setThumbnail(client.user.displayAvatarURL({ size: 1024 })) // صورة البوت على الجنب
                .setFooter({ text: "استخدم الأزرار أدناه للتحكم", iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            if (serverQueue.playingMessage) {
                try {
                    await serverQueue.playingMessage.edit({ embeds: [playEmbed], components: [getControlButtons()] });
                } catch (err) {
                    serverQueue.playingMessage = await serverQueue.textChannel.send({ embeds: [playEmbed], components: [getControlButtons()] });
                }
            } else {
                serverQueue.playingMessage = await serverQueue.textChannel.send({ embeds: [playEmbed], components: [getControlButtons()] });
            }
        }
    } catch (error) {
        console.error("❌ خطأ في عملية التشغيل:", error);
        serverQueue.queue.shift();
        processQueue(client, guildId);
    }
}

module.exports = { getControlButtons, processQueue };