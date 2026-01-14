export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');

    if (!isGroup) return await sock.sendMessage(chat, { text: "Group only command!" });

    // Global variable to store active groups
    if (!global.activeAntilink) global.activeAntilink = [];

    if (args[0] === 'on') {
        if (!global.activeAntilink.includes(chat)) {
            global.activeAntilink.push(chat);
        }
        return await sock.sendMessage(chat, { text: "✅ *Antilink Activated!* \nBot will delete links from non-admins." });
    } 
    
    if (args[0] === 'off') {
        global.activeAntilink = global.activeAntilink.filter(id => id !== chat);
        return await sock.sendMessage(chat, { text: "❌ *Antilink Deactivated.*" });
    }

    // 🛡️ MAIN LINK DETECTOR LOGIC (One-time listener setup)
    if (!global.antilinkLogicSet) {
        global.antilinkLogicSet = true;

        sock.ev.on('messages.upsert', async (chatUpdate) => {
            const m = chatUpdate.messages[0];
            if (!m.message || m.key.fromMe) return;

            const currentChat = m.key.remoteJid;
            if (!global.activeAntilink.includes(currentChat)) return;

            const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
            const hasAnyLink = body.match(/(https?:\/\/[^\s]+)/gi);


            if (isGroupLink) {
                const groupMetadata = await sock.groupMetadata(currentChat);
                const participants = groupMetadata.participants;
                const sender = m.key.participant || m.key.remoteJid;

                const isAdmin = participants.find(p => p.id === sender)?.admin;
                const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const isBotAdmin = participants.find(p => p.id === botId)?.admin;

                // അഡ്മിൻ അല്ലെങ്കിലും ബോട്ട് അഡ്മിൻ ആണെങ്കിലും മാത്രം ഡിലീറ്റ് ചെയ്യുക
                if (!isAdmin && isBotAdmin) {
                    await sock.sendMessage(currentChat, {
                        delete: {
                            remoteJid: currentChat,
                            fromMe: false,
                            id: m.key.id,
                            participant: sender
                        }
                    });
                    await sock.sendMessage(currentChat, { text: "🚫 *Link Removed!* \nAdmins only allowed to share links." });
                }
            }
        });
    }

    // Usage help if no args provided
    if (!args[0]) {
        await sock.sendMessage(chat, { text: "Proper usage: `.antilink on` or `.antilink off`" });
    }
};
