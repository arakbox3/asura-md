export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');

    // ഗ്രൂപ്പിലാണോ എന്ന് നോക്കുന്നു
    if (!isGroup) return await sock.sendMessage(chat, { text: "Group only command!" });

    // Status സൂക്ഷിക്കാൻ global variable ഉപയോഗിക്കുന്നു (Main file മാറ്റേണ്ടതില്ല)
    if (!global.antilinkList) global.antilinkList = new Set();

    if (args[0] === 'on') {
        global.antilinkList.add(chat);
        await sock.sendMessage(chat, { text: "✅ Antilink is now *Active* in this group." });
    } else if (args[0] === 'off') {
        global.antilinkList.delete(chat);
        await sock.sendMessage(chat, { text: "❌ Antilink is now *Disabled*." });
    } else {
        return await sock.sendMessage(chat, { text: "Use: `.antilink on` or `.antilink off`" });
    }

    
    if (!global.antilinkHandlerSet) {
        global.antilinkHandlerSet = true; // ഒന്നിലധികം തവണ ലോഡ് ആകാതിരിക്കാൻ

        sock.ev.on('messages.upsert', async (m) => {
            const upMsg = m.messages[0];
            if (!upMsg.message || upMsg.key.fromMe) return;

            const currentChat = upMsg.key.remoteJid;
            if (!global.antilinkList.has(currentChat)) return;

            const body = upMsg.message.conversation || upMsg.message.extendedTextMessage?.text || "";
            const hasLink = body.match(/chat.whatsapp.com\/([\w\d!?-]+)/gi);

            if (hasLink) {
                const metadata = await sock.groupMetadata(currentChat);
                const participants = metadata.participants;
                const sender = upMsg.key.participant;
                
                const isAdmin = participants.find(p => p.id === sender)?.admin;
                const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const isBotAdmin = participants.find(p => p.id === botId)?.admin;

                if (!isAdmin && isBotAdmin) {
                    // ലിങ്ക് അയച്ച മെസ്സേജ് ഡിലീറ്റ് ചെയ്യുന്നു
                    await sock.sendMessage(currentChat, { 
                        delete: { 
                            remoteJid: currentChat, 
                            fromMe: false, 
                            id: upMsg.key.id, 
                            participant: sender 
                        } 
                    });
                    await sock.sendMessage(currentChat, { text: "⚠️ *Link Detected!* \nOnly admins can share links." });
                }
            }
        });
    }
};
