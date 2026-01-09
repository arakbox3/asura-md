import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const imagePath = './media/thumb.jpg'; 
    const songPath = './media/song.opus'; 

    const aliveMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
*Hello! I'm Asura MD, your fastest Assistant - alive and sparkling now! ✨*

╔━━━━━━━━━━━━━❥❥❥
┃ *⊙🩸ʜᴇᴀʟᴛʜ:- 100% (ᴇxᴄᴇʟʟᴇɴᴛ)*
┃ *⊙⚔️ᴍᴏᴅᴇ:- ᴘᴜʙʟɪᴄ ᴇᴅɪᴛɪᴏɴ*
┃ *⊙🧿ᴘʀᴇꜰɪx:- [ . ]*
╠━━━━━━━━━━━━━❥❥❥
┃ *⊙🔥ᴘᴏᴡᴇʀ:- sᴜᴘᴇʀ sᴏɴɪᴄ ⚡*
┃ *⊙👺ᴅᴇᴠᴇʟᴏᴘᴇʀ:- ᴀʀᴜɴ.ᴄᴜᴍᴀʀ*
╚━━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    try {
        // 1. Send photo
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, { 
                image: fs.readFileSync(imagePath), 
                caption: aliveMsg 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: aliveMsg }, { quoted: msg });
        }

        // 2.  (song.opus )
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { 
                audio: fs.readFileSync(songPath), 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, { quoted: msg });
        }

        // 3. Ads)
        const groupLink = "https://chat.whatsapp.com/LC3HXrnNI8J0481tjPTbtp";
        const channelLink = "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24";
        
        const adMsg = `🏮 *Join our Community:*
Stay updated with Asura MD 

🔗 *Group:* ${groupLink}

> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        await sock.sendMessage(chat, { 
            text: adMsg,
            contextInfo: {
                externalAdReply: {
                    title: "👺 ASURA MD OFFICIAL CHANNEL",
                    body: "Click to Follow our Channel! ✨",
                    mediaType: 1,
                    sourceUrl: channelLink, 
                    showAdAttribution: true,
                    renderLargerThumbnail: false
                }
            }
        });

    } catch (e) {
        console.error("Alive Error:", e);
    }
};
