import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        // 2. ആനിമേഷൻ (Safe Interval 1.2s)
        const { key } = await sock.sendMessage(chat, { text: "👺 Asura MD Loading..." });

        const frames = [
            "💣 ▰▱▱▱▱▱▱▱▱▱ 🔹️10%",
            "💣 ▰▰▰▰▱▱▱▱▱▱ 🔹️40%",
            "💣 ▰▰▰▰▰▰▰▱▱▱ 🔹️70%",
            "💣 ▰▰▰▰▰▰▰▰▰▰ 🔹️100%",
            "🚀 Asura MD Engine Ready!",
            "✅ Sending Menu Now!"
        ];

        for (let frame of frames) {
            await new Promise(resolve => setTimeout(resolve, 1200)); 
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
*╰────────────❂*
╔━━━━━━━━━━❥❥❥
┃ °☆°☆°☆°☆°☆°☆°☆°☆°
╠━━━━⛥❖⛥━━━❥❥❥
┃ ⊙⚡   .Ping  
┃ ⊙🔋   .Alive
┃ ⊙📜   .Menu
┃ ⊙🎵   .Song <name>
┃ ⊙🎬  .Video <name>
┃ ⊙🖼️  .Sticker
┃ ⊙🎮  .Game
┃ ⊙🎭  .Fun
┃ ⊙🤖  .Ai <text>
┃ ⊙🆎️  .Font <text>
┃ ⊙👤  .Owner
┃ ⊙📓  .Help
┃ ⊙🎧  .Play <name>
┃ ⊙📢  .Tagall
┃ ⊙📷  .Image <name>
╚━━━⛥❖⛥━━━❥❥❥
┃ °☆°☆°☆°☆°☆°☆°☆°☆°
╚━━━━⛥❖⛥━━━❥❥❥
> 💡 𝐻𝑜𝑤 𝑡𝑜 𝑈𝑠𝑒:
> 𝑇𝑦𝑝𝑒 𝑎𝑛𝑦 𝑐𝑜𝑚𝑚𝑎𝑛𝑑 𝑠𝑡𝑎𝑟𝑡𝑖𝑛𝑔 𝑤𝑖𝑡ℎ 𝑎 𝐷𝑜𝑡 (.)
> 𝐸𝑥𝑎𝑚𝑝𝑙𝑒: .𝑝𝑖𝑛𝑔 𝑜𝑟 .𝑎𝑙𝑖𝑣𝑒

© 👺 𝐴𝑠𝑢𝑟𝑎 𝑀𝐷 ᴍɪɴɪ ʙᴏᴛ
𝑠ɪᴍᴘʟᴇ ᴡᴀʙᴏᴛ ᴍᴀᴅᴇ ʙʏ 𝑎𝑟𝑢𝑛.𝑐𝑢𝑚𝑎𝑟 ヅ
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

        // 3. Send Image with Menu Text
if (fs.existsSync(imagePath)) {
    await sock.sendMessage(chat, {
        document: { url: './media/thumb.jpg' },
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileName: '👺 ASURA MD', 
        fileLength: 9999999999999,
        pageCount: 666,
        caption: menuText,
        contextInfo: {
            externalAdReply: {
                title: 'Asura MD 👺',
                body: 'A Multi-Device WhatsApp Bot',
                thumbnail: fs.readFileSync(imagePath),
                sourceUrl: 'https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24',
                mediaType: 1,
                renderLargerThumbnail: true 
            }
        }
    }, { quoted: msg });
} else {
    await sock.sendMessage(chat, { text: menuText }, { quoted: msg });
}

        // 4. Send Opus Audio (As Voice Note with Context Info)
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, {
                audio: { url: songPath },
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
