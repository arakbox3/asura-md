import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const thumbPath = './media/thumb.jpg';
    
    // 1. Developer Information Message
    const ownerMsg = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴀꜱᴜʀᴀ ᴍᴅ ᴅᴇᴠᴇʟᴏᴘᴇʀ*
*✧* 「 👺Asᴜʀᴀ MD 」
*╰─────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *👑 Nᴀᴍᴇ:* ᴀʀᴜɴ•°Cᴜᴍᴀʀ
╰━━━━━━━━━━━━━━┈⊷
┃ *🚀 Rᴏʟᴇ:* Mᴀɪɴ Dᴇᴠᴇʟᴏᴘᴇʀ
╰━━━━━━━━━━━━━━┈⊷
┃ *📍 Lᴏᴄᴀᴛɪᴏɴ:* Kᴇʀᴀʟᴀ, Iɴᴅɪᴀ
╰━━━━━━━━━━━━━━┈⊷
┃ *🧬 Bɪᴏ:* Iɴɴᴏᴠᴀᴛɪᴏɴ ᴛʜʀᴏᴜɢʜ Cᴏᴅᴇ!
╠━━━━━━━━━━━━━❥❥❥
┃ *⚡ Sᴛᴀᴛᴜs:* Oɴʟɪɴᴇ & Aᴄᴛɪᴠᴇ
╚━━━━━⛥❖⛥━━━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asᴜʀᴀ MD*
> 📢 Join: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

    // 2. V-Card Contact Details
    const vcard = 'BEGIN:VCARD\n' +
                'VERSION:3.0\n' + 
                'FN:Arun Cumar\n' + 
                'ORG:Asura MD Developer;\n' + 
                'TEL;type=CELL;type=VOICE;waid=917736811908:+91 7736811908\n' + 
                'END:VCARD';

    try {
        // image send
        if (fs.existsSync(thumbPath)) {
            await sock.sendMessage(chat, { 
                image: fs.readFileSync(thumbPath), 
                caption: ownerMsg 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: ownerMsg }, { quoted: msg });
        }

        // Step 2: ഡെവലപ്പർ കോൺടാക്റ്റ് കാർഡ് അയക്കുന്നു
        await sock.sendMessage(chat, { 
            contacts: { 
                displayName: 'arun Cumar', 
                contacts: [{ vcard }] 
            } 
        }, { quoted: msg });

        // Step 3: പ്രൊഫഷണൽ ലുക്കിനായി ലൊക്കേഷൻ മെസ്സേജ് അയക്കുന്നു
        await sock.sendMessage(chat, {
            location: { 
                degreesLatitude: 10.8505, 
                degreesLongitude: 76.2711 
            },
            name: 'Arun Cumar - Asura MD HQ',
            address: 'Kerala, India 🇮🇳',
            comment: 'The home of Asura MD Development'
        }, { quoted: msg });

    } catch (e) {
        console.error("Owner Cmd Error:", e);
    }
};
