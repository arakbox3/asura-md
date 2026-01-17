export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    // ഡാറ്റാബേസ് സെറ്റപ്പ്
    if (!global.db) global.db = { groups: {}, settings: { mode: 'public', antispam: false } };
    if (!global.db.groups[chat]) global.db.groups[chat] = { antilink: false, welcome: false };

    const body = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").toLowerCase();
    const command = body.split(' ')[0].slice(1); // കമാൻഡ് എടുക്കുന്നു
    const action = body.split(' ')[1]; // on/off/public/private എടുക്കുന്നു

    // 1. MODE (Public/Private)
    if (command === 'mode') {
        if (action === 'public') {
            global.db.settings.mode = 'public';
            return await sock.sendMessage(chat, { text: "🌐 *BOT MODE SET TO PUBLIC*" });
        } else if (action === 'private') {
            global.db.settings.mode = 'private';
            return await sock.sendMessage(chat, { text: "🔒 *BOT MODE SET TO PRIVATE*" });
        }
    }

    // 2. ANTILINK (on/off)
    if (command === 'antilink' && isGroup) {
        global.db.groups[chat].antilink = (action === 'on');
        return await sock.sendMessage(chat, { text: `🛡️ *ANTILINK:* ${action === 'on' ? 'ON' : 'OFF'}` });
    }

    // 3. ANTISPAM (on/off)
    if (command === 'antispam') {
        global.db.settings.antispam = (action === 'on');
        return await sock.sendMessage(chat, { text: `⚠️ *ANTISPAM:* ${action === 'on' ? 'ON' : 'OFF'}` });
    }

    // 4. WELCOME (on/off)
    if (command === 'welcome' && isGroup) {
        global.db.groups[chat].welcome = (action === 'on');
        return await sock.sendMessage(chat, { text: `👋 *WELCOME:* ${action === 'on' ? 'ON' : 'OFF'}` });
    }

    // SETTINGS MENU (.setting)
    if (command === 'setting' || command === 'settings') {
        const menu = `
╭━━〔 𓆩 👺 *ASURA MD* 𓆪 〕━━┈⊷
┃
┃ ⚙️ *MAIN SETTINGS*
┃
┃ 🔒 *MODE:* ${global.db.settings.mode.toUpperCase()}
┃ 🛡️ *ANTILINK:* ${global.db.groups[chat].antilink ? 'ON ✅' : 'OFF ❌'}
┃ ⚠️ *ANTISPAM:* ${global.db.settings.antispam ? 'ON ✅' : 'OFF ❌'}
┃ 👋 *WELCOME:* ${global.db.groups[chat].welcome ? 'ON ✅' : 'OFF ❌'}
┃
┣━━━━━━━━━━━━━━━┈⊷
┃ 💡 *Usage:*
┃ .mode public/private
┃ .antilink on/off
┃ .antispam on/off
┃ .welcome on/off
╰━━━━━━━━━━━━━━━┈⊷`;
        return await sock.sendMessage(chat, { text: menu });
    }

    // --- ബാക്ക്ഗ്രൗണ്ട് ലിങ്ക് ഫിൽട്ടർ (ഇത് ഒരിക്കൽ മാത്രം സെറ്റ് ചെയ്യും) ---
    if (!global.asuraWatcher) {
        global.asuraWatcher = true;
        sock.ev.on('messages.upsert', async (update) => {
            const m = update.messages[0];
            if (!m.message || m.key.fromMe) return;
            const cJid = m.key.remoteJid;

            // Antilink Execution
            if (cJid.endsWith('@g.us') && global.db.groups[cJid]?.antilink) {
                const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
                if (/(https?:\/\/[^\s]+|www\.[^\s]+)/gi.test(text)) {
                    await sock.sendMessage(cJid, { delete: m.key });
                }
            }
        });
    }
};
