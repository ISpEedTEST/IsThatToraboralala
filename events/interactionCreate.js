const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require("discord.js");
const { getDb } = require("../utils/dbManager");
const { AudioPlayerStatus } = require("@discordjs/voice");

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        // 1. معالجة الإكمال التلقائي (Autocomplete)
        if (interaction.isAutocomplete()) {
            const db = getDb();
            const userFiles = db[interaction.user.id] || [];
            const focusedValue = interaction.options.getFocused();
            
            const filtered = userFiles.filter(file => file.name.toLowerCase().includes(focusedValue.toLowerCase()));
            await interaction.respond(
                filtered.slice(0, 25).map(file => ({ name: `🎵 ${file.name}`, value: file.name }))
            );
            return;
        }

        // 2. معالجة الأوامر (Slash Commands)
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: '❌ حدث خطأ أثناء تنفيذ الأمر!', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: '❌ حدث خطأ أثناء تنفيذ الأمر!', flags: MessageFlags.Ephemeral });
                }
            }
        }

        // 3. معالجة الأزرار (Buttons)
        if (interaction.isButton()) {
            const data = client.guildData.get(interaction.guild.id);
            if (!data || !data.player) return interaction.update({ components: [] }).catch(() => {}); 

            if (interaction.customId === "btn_set_vol") {
                const modal = new ModalBuilder().setCustomId("modal_volume").setTitle("إعدادات الصوت");
                const volumeInput = new TextInputBuilder()
                    .setCustomId("input_volume")
                    .setLabel("مستوى الصوت (0 - 200)")
                    .setStyle(TextInputStyle.Short)
                    .setValue(String(data.volume * 100))
                    .setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(volumeInput));
                return interaction.showModal(modal);
            }

            if (interaction.customId === "btn_pause_resume") {
                const embed = EmbedBuilder.from(interaction.message.embeds[0]);
                if (data.player.state.status === AudioPlayerStatus.Playing) {
                    data.player.pause();
                    embed.setTitle("⏸️ المقطع متوقف مؤقتاً").setColor("#f1c40f");
                } else {
                    data.player.unpause();
                    embed.setTitle("🎶 جاري التشغيل الآن").setColor("#2ecc71");
                }
                await interaction.update({ embeds: [embed] });
            } 
            else if (interaction.customId === "btn_skip") {
                await interaction.deferUpdate();
                data.skipRequested = true;
                data.player.stop();
            } 
            else if (interaction.customId === "btn_stop") {
                data.queue = [];
                data.player.stop();
                data.connection.destroy();
                client.guildData.delete(interaction.guild.id);
                await interaction.update({ embeds: [new EmbedBuilder().setColor("#e74c3c").setTitle("🛑 تم إنهاء التشغيل ومغادرة الروم")], components: [] });
            }
        }

        // 4. معالجة النوافذ المنبثقة (Modals)
        if (interaction.isModalSubmit() && interaction.customId === "modal_volume") {
            const vol = parseInt(interaction.fields.getTextInputValue("input_volume"), 10);
            if (isNaN(vol) || vol < 0 || vol > 200) return interaction.reply({ content: "❌ الرجاء إدخال رقم صحيح بين 0 و 200.", flags: MessageFlags.Ephemeral });

            const data = client.guildData.get(interaction.guild.id);
            if (data) {
                data.volume = vol / 100;
                if (data.currentResource) data.currentResource.volume.setVolume(data.volume);
                await interaction.reply({ content: `🎚️ تم ضبط مستوى الصوت بنجاح إلى: **${vol}%**`, flags: MessageFlags.Ephemeral });
            }
        }
    }
};