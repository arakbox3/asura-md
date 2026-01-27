import fs from 'fs';

const DB_PATH = './media/asura_db.json';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const input = args[0]?.toLowerCase();

    // 1. ഇൻപുട്ട് ചെക്ക് ചെയ്യുന്നു
    if (!input || (input !== 'on' && input !== 'off')) {
        return sock.sendMessage(chat, { 
            text: "⚠️ *Invalid Usage*\n\n💡 Use: `.welcome on` or `.welcome off`" 
        }, { quoted: msg });
    }

    try {
        // 2. ഡാറ്റാബേസ് റീഡ് ചെയ്യുന്നു (ഫയൽ ഇല്ലെങ്കിൽ പുതിയത് ഉണ്ടാക്കുന്നു)
        let db = {};
        if (fs.existsSync(DB_PATH)) {
            db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        }

        // 3. സെറ്റിംഗ്സ് അപ്ഡേറ്റ് ചെയ്യുന്നു
        if (!db[chat]) db[chat] = {};
        db[chat].welcome = (input === 'on');

        // 4. ഡാറ്റാബേസ് സേവ് ചെയ്യുന്നു
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        // 5. പ്രൊഫഷണൽ രീതിയിലുള്ള കൺഫർമേഷൻ മെസ്സേജ്
        const status = input === 'on' ? 'ENABLED 🟢' : 'DISABLED 🔴';
        const response = `🛡️ *SYSTEM NOTIFICATION*\n\n📢 *Feature:* Welcome Message\n✅ *Status:* ${status}\n📍 *Group:* ${chat.split('@')[0]}`;

        await sock.sendMessage(chat, { text: response }, { quoted: msg });

    } catch (error) {
        console.error("Welcome Command Error:", error);
        await sock.sendMessage(chat, { text: "❌ *Database Error:* Could not save settings." });
    }
};
