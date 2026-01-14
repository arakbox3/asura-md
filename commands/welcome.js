export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');

    if (!isGroup) return await sock.sendMessage(chat, { text: "This is a Group-only command!" });

    // Status സൂക്ഷിക്കാൻ global variable ഉപയോഗിക്കുന്നു
    if (!global.welcomeList) global.welcomeList = new Set();

    if (args[0] === 'on') {
        global.welcomeList.add(chat);
        await sock.sendMessage(chat, { text: "✅ *Welcome Message is now ON for this group.*" });
    } else if (args[0] === 'off') {
        global.welcomeList.delete(chat);
        await sock.sendMessage(chat, { text: "❌ *Welcome Message is now OFF.*" });
    } else {
        return await sock.sendMessage(chat, { text: "Usage: `.welcome on` or `.welcome off`" });
    }

    // 🛡️ ജോയിൻ ചെയ്യുന്നത് നിരീക്ഷിക്കാനുള്ള ലോജിക്
    if (!global.welcomeHandlerSet) {
        global.welcomeHandlerSet = true;

        sock.ev.on('group-participants.update', async (update) => {
            const { id, participants, action } = update;
            
            // ഈ ഗ്രൂപ്പിൽ വെൽക്കം ഓൺ ആണോ എന്ന് നോക്കുന്നു
            if (global.welcomeList.has(id) && action === 'add') {
                for (let num of participants) {
                    try {
                        // ഗ്രൂപ്പ് വിവരങ്ങൾ എടുക്കുന്നു
                        const metadata = await sock.groupMetadata(id);
                        const welcomeText = `Hello @${num.split('@')[0]} 👋,\n\nWelcome to *${metadata.subject}*! ✨\n\nHope you have a great time here. Read the rules and enjoy!`;

                        await sock.sendMessage(id, {
                            text: welcomeText,
                            mentions: [num],
                            contextInfo: {
                                externalAdReply: {
                                    title: "👺 ASURA MD WELCOME",
                                    body: "A new member has joined!",
                                    thumbnailUrl: "https://telegra.ph/file/48d51624b553922c2629b.jpg",
                                    mediaType: 1,
                                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24"
                                }
                            }
                        });
                    } catch (err) {
                        console.log("Welcome Error: ", err);
                    }
                }
            }
        });
    }
};
