import fs from 'fs';

const dbPath = './welcome_db.json';
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

export default async (sock) => {

    // 1. കമാൻഡ് ഹാൻഡ്ലർ (.welcome on/off - Admins Only)
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const chat = msg.key.remoteJid;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
            
            if (text.toLowerCase() === '.welcome on' || text.toLowerCase() === '.welcome off') {
                const metadata = await sock.groupMetadata(chat);
                const sender = msg.key.participant || msg.key.remoteJid;
                const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;
                
                if (!isAdmin) return; // അഡ്മിൻ അല്ലെങ്കില്‍ മറുപടി നല്‍കില്ല

                let db = JSON.parse(fs.readFileSync(dbPath));
                db[chat] = text.toLowerCase() === '.welcome on';
                fs.writeFileSync(dbPath, JSON.stringify(db));

                const statusMsg = await sock.sendMessage(chat, { 
                    text: `*Welcome System ${db[chat] ? 'Activated ✅' : 'Deactivated ❌'}*` 
                }, { quoted: msg });

                // 10 സെക്കന്റിന് ശേഷം സ്റ്റാറ്റസ് മെസ്സേജ് ഡിലീറ്റ് ചെയ്യുന്നു
                setTimeout(async () => {
                    await sock.sendMessage(chat, { delete: statusMsg.key });
                }, 10000);
            }
        } catch (e) { console.log(e) }
    });

    // 2. മിനി വെൽക്കം ഹാൻഡ്ലർ (Auto-Delete)
    sock.ev.on('group-participants.update', async (anu) => {
        try {
            const chat = anu.id;
            let db = JSON.parse(fs.readFileSync(dbPath));
            if (!db[chat] || anu.action !== 'add') return;

            for (let jid of anu.participants) {
                const welcomeText = `*👺 ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ɢʀᴏᴜᴘ 👺*

*👤 ᴜsᴇʀ:* @${jid.split('@')[0]}
*✨ ɢʀᴏᴜᴘ:* ${ (await sock.groupMetadata(chat)).subject }

> *© 👺ᴀsᴜʀᴀ ᴍᴅ*`;

                const sentMsg = await sock.sendMessage(chat, {
                    text: welcomeText,
                    mentions: [jid]
                });

                // 30 സെക്കന്റിന് ശേഷം വെൽക്കം മെസ്സേജ് ഓട്ടോമാറ്റിക്കായി ഡിലീറ്റ് ചെയ്യുന്നു
                setTimeout(async () => {
                    await sock.sendMessage(chat, { delete: sentMsg.key });
                }, 30000);
            }
        } catch (err) {
            console.log('Welcome Error: ', err);
        }
    });
};
