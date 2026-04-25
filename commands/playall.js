const { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice");
const { getDb } = require("../utils/dbManager");
const { processQueue } = require("../utils/musicHelper");

module.exports = {
    name: "playall",
    description: "📑 تشغيل جميع المقاطع المحفوظة في مكتبتك",
    options: [
        { name: "shuffle", type: ApplicationCommandOptionType.Boolean, description: "تشغيل عشوائي؟ (True لخلط المقاطع)", required: false }
    ],
    async execute(interaction, client) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.reply({ content: "❌ يجب أن تكون في روم صوتي أولاً!", flags: MessageFlags.Ephemeral });

        const db = getDb();
        const userFiles = db[interaction.user.id] || [];
        if (userFiles.length === 0) return interaction.reply({ content: "📭 مكتبتك فارغة! ارفع مقاطعك أولاً.", flags: MessageFlags.Ephemeral });

        await interaction.deferReply();

        let tracksToAdd = userFiles.map(f => ({ title: f.name, url: f.path, type: "local" }));
        const isShuffle = interaction.options.getBoolean("shuffle");
        
        if (isShuffle) {
            tracksToAdd = tracksToAdd.sort(() => Math.random() - 0.5);
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
                queue: [...tracksToAdd],
                originalLibrary: [...tracksToAdd],
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

            const startEmbed = new EmbedBuilder()
                .setColor("#3498db")
                .setDescription(`📑 جاري تجهيز **${tracksToAdd.length}** مقطع${isShuffle ? " (بترتيب عشوائي 🔀)" : ""}...`);
                
            await interaction.editReply({ embeds: [startEmbed] });
            processQueue(client, interaction.guildId);
        } else {
            serverQueue.queue.push(...tracksToAdd);
            if(serverQueue.originalLibrary) serverQueue.originalLibrary.push(...tracksToAdd);
            
            const addEmbed = new EmbedBuilder()
                .setColor("#9b59b6")
                .setDescription(`✅ تمت إضافة **${tracksToAdd.length}** مقطع إلى قائمة الانتظار ${isShuffle ? "🔀" : ""}`);
            return interaction.editReply({ embeds: [addEmbed] });
        }
    }
};