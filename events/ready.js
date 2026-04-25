const { REST, Routes } = require("discord.js");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log(`🤖 البوت متصل باسم: ${client.user.tag}`);
        
        // تجهيز بيانات الأوامر لإرسالها لديسكورد
        const commandsData = client.commands.map(cmd => ({
            name: cmd.name,
            description: cmd.description,
            options: cmd.options || [],
        }));

        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
        
        try {
            console.log("⏳ جاري تسجيل الأوامر (Slash Commands)...");
            await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commandsData });
            console.log("✅ تم تسجيل الأوامر بنجاح!");
        } catch (error) {
            console.error("❌ خطأ في تسجيل الأوامر:", error);
        }
        // try {
        //     console.log('🚨 بدء عملية التنظيف الشاملة...');
    
        //     // 1. مسح الأوامر المعلقة في السيرفر (Guild Commands)
        //     console.log('🧹 جاري تدمير أوامر السيرفر القديمة...');
        //     await rest.put(
        //         Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        //         { body: [] } // مصفوفة فارغة تعني مسح كل شيء
        //     );
        //     console.log('✅ تم تنظيف السيرفر بنجاح!');
    
        //     // 2. مسح الأوامر العامة (Global Commands) للتأكيد
        //     console.log('🧹 جاري تدمير الأوامر العامة القديمة...');
        //     await rest.put(
        //         Routes.applicationCommands(process.env.CLIENT_ID),
        //         { body: [] }
        //     );
        //     console.log('✅ تم تنظيف الأوامر العامة بنجاح!');
    
        //     console.log('✨ اكتملت العملية! البوت الآن "فارغ تماماً" من أي أوامر سابقة.');
        // } catch (error) {
        //     console.error('❌ حدث خطأ أثناء التنظيف:', error);
        // }
    }
};