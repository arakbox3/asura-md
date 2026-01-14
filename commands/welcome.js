export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');

    if (!isGroup) return await sock.sendMessage(chat, { text: "❌ Group only command!" });

    // Status സൂക്ഷിക്കാൻ global variable
    if (!global.activeWelcome) global.activeWelcome = [];

    if (args[0] === 'on') {
        if (!global.activeWelcome.includes(chat)) {
            global.activeWelcome.push(chat);
        }
        return await sock.sendMessage(chat, { text: "✅ *Welcome Message Activated!*" });
    } 
    
    if (args[0] === 'off') {
        global.activeWelcome = global.activeWelcome.filter(id => id !== chat);
        return await sock.sendMessage(chat, { text: "❌ *Welcome Message Disabled.*" });
    }

    // 🛡️ ഈ ഭാഗമാണ് പുതിയ ആളുകൾ വരുമ്പോൾ മെസ്സേജ് അയക്കുന്നത്
    if (!global.welcomeEventSet) {
        global.welcomeEventSet = true; // ഒന്നിലധികം തവണ സെറ്റ് ആകാതിരിക്കാൻ

        sock.ev.on('group-participants.update', async (anu) => {
            // ആക്ടീവ് ലിസ്റ്റിലുള്ള ഗ്രൂപ്പാണോ എന്ന് നോക്കുന്നു
            if (!global.activeWelcome.includes(anu.id)) return;
            
            if (anu.action === 'add') {
                for (let num of anu.participants) {
                    try {
                        const metadata = await sock.groupMetadata(anu.id);
                        const user = num.split('@')[0];
                        
                        let welcomeMsg = `Welcome @${user} 👋\n\nTo *${metadata.subject}* ✨`;

                        await sock.sendMessage(anu.id, { 
                            text: welcomeMsg,
                            mentions: [num],
                            contextInfo: {
                                externalAdReply: {
                                    title: "👺 ASURA MD WELCOME",
                                    body: "New Member Joined!",
                                    thumbnailUrl: "https://telegra.ph/file/48d51624b553922c2629b.jpg", 
                                    mediaType: 1,
                                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24"
                                }
                            }
                        });
                    } catch (e) {
                        console.log("Welcome error:", e);
                    }
                }
            }
        });
    }

    if (!args[0]) {
        await sock.sendMessage(chat, { text: "Usage: `.welcome on` to enable or `.welcome off` to disable." });
    }
};
