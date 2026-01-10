import fs from 'fs';
import path from 'path';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;

    try {
        // 1. Reaction
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        // 2. Loading Animation
        const { key } = await sock.sendMessage(chat, { text: "👺 Asura MD Loading..." });

        const frames = [
            "▰▱▱▱▱▱▱▱▱▱ 10%",
            "▰▰▰▰▱▱▱▱▱▱ 40%",
            "▰▰▰▰▰▰▰▱▱▱ 70%",
            "▰▰▰▰▰▰▰▰▰▰ 100%",
            "🚀 Asura MD Engine Ready!",
            "✅ Sending Menu Now!"
        ];

        for (let frame of frames) {
            await new Promise(resolve => setTimeout(resolve, 800)); // സമയം അല്പം കുറച്ചു (Fast feel)
            await sock.sendMessage(chat, { text: frame, edit: key });
        }

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

        const imagePath = './media/thumb.jpg'; 
        const songPath = './media/song.opus'; 

        const menuText = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰───────────❂*
╔━━━━━━━━━━━❥❥❥
┃ *⊙ .Ping*
┃ *⊙ .Alive*
┃ *⊙ .Menu*
┃ *⊙ .Song <name>*
┃ *⊙ .Video <name>*
┃ *⊙ .Sticker*
┃ *⊙ .Game*
┃ *⊙ .Fun*
┃ *⊙ .Ai <text>*
┃ *⊙ .Font <text>*
┃ *⊙ .Owner*
┃ *⊙ .Help*
┃ *⊙ .Play <name>*
┃ *⊙ .Tagall*
┃ *⊙ .Image <name>*
╚━━━━⛥❖⛥━━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        const buttons = [
            { buttonId: '.alive', buttonText: { displayText: '🩸 Alive' }, type: 1 },
            { buttonId: '.ping', buttonText: { displayText: '📡 Ping' }, type: 1 },
            { buttonId: '.owner', buttonText: { displayText: '👑 Owner' }, type: 1 }
        ];

        // 3. Send Image with Buttons
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, {
                image: fs.readFileSync(imagePath),
                caption: menuText,
                footer: "Powered by Asura MD",
                buttons: buttons,
                headerType: 4
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: menuText, buttons: buttons, footer: "Powered by Asura MD" }, { quoted: msg });
        }

        // 4. Send Opus Audio
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, {
                audio: fs.readFileSync(songPath),
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
                contextInfo: {
                    externalAdReply: {
                        title: 'Asura MD 👺',
                        body: 'Playing Menu Theme...',
                        thumbnail: fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null,
                        mediaType: 1,
                        sourceUrl: 'https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24'
                    }
                }
            }, { quoted: msg });
        }

    } catch (error) {
        console.error("Error in menu command:", error);
    }
};

