export default async (sock, msg, args) => {
    try {
        const chat = msg.key.remoteJid;
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        
        // 1. ടാർഗെറ്റ് യൂസറെ കണ്ടുപിടിക്കുന്നു (Reply, Mention, or Number)
        let user = quoted?.participant || quoted?.mentionedJid?.[0];
        
        if (!user && args[0]) {
            let num = args[0].replace(/[^0-9]/g, '');
            if (num.length > 8) user = num + '@s.whatsapp.net';
        }

        if (!user) {
            return sock.sendMessage(chat, { text: "❌ ടാഗ് ചെയ്യുകയോ നമ്പർ നൽകുകയോ ചെയ്യുക!" }, { quoted: msg });
        }

        // 2. ഗ്രൂപ്പിലേക്ക് ആഡ് ചെയ്യുന്നു
        await sock.groupParticipantsUpdate(chat, [user], "add");
        
        // 3. സക്സസ് മെസ്സേജ്
        await sock.sendMessage(chat, { text: `✅ @${user.split('@')[0]} ഗ്രൂപ്പിലേക്ക് ചേർത്തു.`, mentions: [user] }, { quoted: msg });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ എറർ: ബോട്ട് അഡ്മിൻ ആണോ എന്ന് പരിശോധിക്കുക!" });
    }
};
