import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const imagePath = './media/thumb.jpg';
    const audioPath = './media/song.opus'; 

    try {
        await sock.sendMessage(chat, { react: { text: "⚡", key: msg.key } });

        const { key } = await sock.sendMessage(chat, { text: "🚀 Connecting to Asura Server..." });

        const frames = [
            "📶 Tᴇsᴛɪɴɢ Lᴀᴛᴇɴᴄʏ...",
            "📡 Nᴇᴛᴡᴏʀᴋ: Sᴛᴀʙʟᴇ",
            "👺 Asᴜʀᴀ MD Eɴɢɪɴᴇ Rᴇᴀᴅʏ!"
        ];

        for (let frame of frames) {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            await sock.sendMessage(chat, { text: frame, edit: key });
        }

        // Ping Calculation
        const ping = Date.now() - (msg.messageTimestamp * 1000);
        
        // Speed/Status Logic (Uptime-ന് പകരം)
        const speedStatus = ping < 500 ? "Turbo 🚀" : "Normal ⚡";
        const netStatus = "🟢 High Speed";

        const pingMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰────────────❂*

╭╌❲ *ʙᴏᴛ ᴘᴇʀꜰᴏʀᴍᴀɴᴄᴇ* ❳
╎ ⊙ 🚀𝚂𝚙𝚎𝚎𝚍 : ${speedStatus}
╰━━━━━━━━━━━━━━┈⊷
╎ ⊙ 📡𝙻𝚊𝚝𝚎𝚗𝚌𝚢 : ${Math.abs(ping)} 𝚖𝚜
╰━━━━━━━━━━━━━━┈⊷
╎ ⊙ 📶𝙽𝚎𝚝𝚠𝚘𝚛𝚔 : ${netStatus}
╰━━━━━━━━━━━━━━┈⊷
╎ ⊙ 👨‍💻𝙳𝚎𝚟 : arun.Cumar
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

      
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, { 
                image: fs.readFileSync(imagePath), 
                caption: pingMsg 
            }, { quoted: msg });
        }

        if (fs.existsSync(audioPath)) {
            await sock.sendMessage(chat, { 
                audio: fs.readFileSync(audioPath), 
                mimetype: 'audio/ogg', 
                ptt: true 
            }, { quoted: msg });
        }

        // Ads with Newsletter info
        const adMsg = `🏮 *Asura MD Community:* https://chat.whatsapp.com/LdNb1Ktmd70EwMJF3X6xPD`;

             await sock.sendMessage(chat, { 
             text: adMsg,
            contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
            newsletterJid: '120363422992896382@newsletter',
            newsletterName: '👺 ASURA-MD', 
            serverMessageId: 143
               },             
        forwardingScore: 999,
                externalAdReply: {
                    title: "👺 ASURA MD OFFICIAL COMMUNITY",
                    body: "Join now for bot support! ✨",
                    thumbnail: fs.readFileSync(imagePath),
                    sourceUrl: 'https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24',
                    mediaType: 1,
                    renderLargerThumbnail: true 
                }
            }
        });

    } catch (e) {
        console.error("Ping Error:", e);
    }
};
