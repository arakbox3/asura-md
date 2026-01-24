import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import fs from "fs";

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const imagePath = './media/thumb.jpg';
    const songPath = './media/song.opus';

    // മെസ്സേജ് ഒബ്ജക്റ്റ് കണ്ടെത്തുന്നു
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const message = msg.message?.imageMessage || msg.message?.videoMessage || 
                    quoted?.imageMessage || quoted?.videoMessage || 
                    msg.message?.viewOnceMessageV2?.message?.imageMessage || 
                    msg.message?.viewOnceMessageV2?.message?.videoMessage;

    try {
        if (!message) {
            const helpMsg = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙🖼 Reply to Image/Gif/Video*
┃ *⊙🎨 Command: .sticker*
╠━━━━━━━━━━━━━❥❥❥
┃ *👑Creator:-* arun•°Cumar
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

            if (fs.existsSync(imagePath)) {
                return sock.sendMessage(chat, { image: { url: imagePath }, caption: helpMsg });
            } else {
                return sock.sendMessage(chat, { text: helpMsg });
            }
        }

        // മീഡിയ ടൈപ്പ് കൃത്യമായി കണ്ടെത്തുന്നു
        const isVideo = message.hasOwnProperty('videoMessage') || (message.mimetype && message.mimetype.includes('video'));
        const mediaType = isVideo ? 'video' : 'image';

        // പ്രോസസ്സിംഗ് മെസ്സേജ്
        await sock.sendMessage(chat, { text: "⏳ *Asura MD Processing Your Sticker...*" }, { quoted: msg });

        // മീഡിയ ബഫറിലേക്ക് ഡൗൺലോഡ് ചെയ്യുന്നു
        const stream = await downloadContentFromMessage(message, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // സ്റ്റിക്കർ നിർമ്മാണം
        const sticker = new Sticker(buffer, {
            pack: 'Asura MD 👺', 
            author: 'Arun Cumar', 
            type: StickerTypes.FULL, 
            categories: ['🤩', '🎉'],
            id: 'asura-md-sticker',
            quality: 30, 
            effort: 2    
        });

        const stickerBuffer = await sticker.toBuffer();

        // സ്റ്റിക്കർ അയക്കുന്നു
        await sock.sendMessage(chat, { sticker: stickerBuffer }, { quoted: msg });

        // ഓഡിയോ അയക്കുന്നു (ഉണ്ടെങ്കിൽ മാത്രം)
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { 
                audio: { url: songPath }, 
                mimetype: 'audio/ogg; codecs=opus', 
                ptt: true 
            }, { quoted: msg });
        }

    } catch (error) {
        console.error("Sticker Error:", error);
        sock.sendMessage(chat, { text: "❌ *Error:* സ്റ്റിക്കർ നിർമ്മാണം പരാജയപ്പെട്ടു. വീഡിയോ ആണെങ്കിൽ 7 സെക്കൻഡിൽ താഴെയാണെന്ന് ഉറപ്പുവരുത്തുക." });
    }
};
