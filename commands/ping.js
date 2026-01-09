import fs from 'fs';

// ബോട്ട് സ്റ്റാർട്ട് ചെയ്ത സമയം കൃത്യമായി കിട്ടാൻ
const startTime = Date.now();

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const imagePath = './media/thumb.jpg';

    try {
        await sock.sendMessage(chat, { react: { text: "⚡", key: msg.key } });

        const { key } = await sock.sendMessage(chat, { text: "🚀 Checking System..." });

        const frames = [
            "📶 Analyzing Server...",
            "📡 Calculating Ping...",
            "⏳ Fetching Uptime...",
            "👺 Asura MD Engine Ready!"
        ];

        for (let frame of frames) {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            await sock.sendMessage(chat, { text: frame, edit: key });
        }

        // 1. Ping Calculation
        const ping = Date.now() - (msg.messageTimestamp * 1000);
        
        // 2. Uptime Calculation (Fixed)
        const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = uptimeSeconds % 60;
        const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

        const pingMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰────────────❂*
*Hello! I'm Asura MD, your fastest Assistant! ✨*

╭╌❲ *ʙᴏᴛ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ* ❳
╎ ⊙ 🤖𝙱𝚘𝚝 : 👺Asura MD
╎ ⊙ 📡𝙿𝚒𝚗𝚐 : ${Math.abs(ping)} 𝚖𝚜
╎ ⊙ 🕝𝚄𝚙𝚝𝚒𝚖𝚎: ${uptimeString}
╎ ⊙ 👨‍💻𝙾𝚠𝚗𝚎𝚛 : arun.Cumar
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // 3. Main Message
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, { 
                image: fs.readFileSync(imagePath), 
                caption: pingMsg 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: pingMsg }, { quoted: msg });
        }

        // 4. Always On Ads (Fixed Link & Design)
        const groupLink = "https://chat.whatsapp.com/LC3HXrnNI8J0481tjPTbtp";
        const channelLink = "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24";

        const adMsg = `*🏮 Asura MD Community*
Stay updated with us!

*Group:* ${groupLink}
*Channel:* ${channelLink}`;

        await sock.sendMessage(chat, { 
            text: adMsg,
            contextInfo: {
                externalAdReply: {
                    title: "👺 ASURA MD SUPPORT",
                    body: "Click to Join Channel & Group! ✨",
                    mediaType: 1,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24", // Fixed Quotes
                    showAdAttribution: true,
                    renderLargerThumbnail: false
                }
            }
        });

    } catch (e) {
        console.error("Ping Error:", e);
    }
};
