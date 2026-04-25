const { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice");
const fs = require("fs");
const { getDb } = require("../utils/dbManager");
const { processQueue } = require("../utils/musicHelper");

module.exports = {
    name: "play",
    description: "▶️ تشغيل مقطع من جهازك أو مكتبتك",
    options: [
        { name: "saved_name", type: ApplicationCommandOptionType.String, description: "اسم المقطع من مكتبتك", required: false, autocomplete: true },
        { name: "file", type: ApplicationCommandOptionType.Attachment, description: "رفع ملف صوتي مؤقت", required: false },
    ],
    async execute(interaction, client) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.reply({ content: "❌ يجب أن تكون في روم صوتي أولاً!", flags: MessageFlags.Ephemeral });

        const savedName = interaction.options.getString("saved_name");
        const attachment = interaction.options.getAttachment("file");

        if (!attachment && !savedName) return interaction.reply({ content: "❌ أدخل اسم المقطع أو ارفع ملفاً!", flags: MessageFlags.Ephemeral });

        await interaction.deferReply();
        let track = { title: "", url: "", type: "local" };

        if (savedName) {
            const db = getDb();
            const userFiles = db[interaction.user.id] || [];
            const targetFile = userFiles.find((f) => f.name.toLowerCase() === savedName.toLowerCase().trim());
            
            if (!targetFile || !fs.existsSync(targetFile.path)) {
                return interaction.editReply({ embeds: [new EmbedBuilder().setColor("#e74c3c").setDescription(`❌ لم أجد المقطع "**${savedName}**".`)] });
            }
            track = { title: targetFile.name, url: targetFile.path, type: "local" };
        } else if (attachment) {
            if (!attachment.contentType?.startsWith("audio/")) return interaction.editReply("❌ الملف المرفوع ليس ملفاً صوتياً.");
            track = { title: attachment.name, url: attachment.url, type: "attachment" };
        }

        let serverQueue = client.guildData.get(interaction.guildId);

        if (!serverQueue) {
            const player = createAudioPlayer();
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: true,
            });

            serverQueue = {
                textChannel: interaction.channel,
                player: player,
                connection: connection,
                queue: [track],
                originalLibrary: [track],
                loopMode: "off",
                volume: 1.0,
                playingMessage: null,
                skipRequested: false
            };
            
            client.guildData.set(interaction.guildId, serverQueue);
            connection.subscribe(player);

            player.on(AudioPlayerStatus.Idle, () => {
                const sq = client.guildData.get(interaction.guildId);
                if (!sq) return;
                let isTrackLoop = false;

                if (sq.skipRequested) {
                    sq.queue.shift();
                    sq.skipRequested = false; 
                } else if (sq.loopMode === "off") {
                    sq.queue.shift();
                } else if (sq.loopMode === "queue") {
                    const finishedTrack = sq.queue.shift();
                    sq.queue.push(finishedTrack);
                } else if (sq.loopMode === "track") {
                    isTrackLoop = true;
                }

                if (sq.queue.length === 0 && sq.loopMode !== "off" && sq.originalLibrary?.length > 0) {
                    sq.queue = [...sq.originalLibrary];
                }

                processQueue(client, interaction.guildId, isTrackLoop);
            });

            await interaction.editReply({ embeds: [new EmbedBuilder().setColor("#3498db").setDescription("⏳ جاري تجهيز المشغل...")] });
            processQueue(client, interaction.guildId);
        } else {
            serverQueue.queue.push(track);
            if(serverQueue.originalLibrary) serverQueue.originalLibrary.push(track);
            const embed = new EmbedBuilder().setColor("#9b59b6").setDescription(`✅ تمت الإضافة: **${track.title}**\n(الترتيب: ${serverQueue.queue.length - 1})`);
            return interaction.editReply({ embeds: [embed] });
        }
    }
};