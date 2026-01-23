import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    
    // Check if there is a replied message
    if (!quoted) {
        return sock.sendMessage(chat, { text: "❌ Please reply to a media message (Image, Video, Audio, or Sticker) to convert it." }, { quoted: msg });
    }

    // Identify the media type and mimetype
    const mime = Object.values(quoted)[0]?.mimetype || "";
    const messageType = Object.keys(quoted)[0].replace('Message', '');

    if (!mime) {
        return sock.sendMessage(chat, { text: "❌ No media found in the replied message." }, { quoted: msg });
    }

    try {
        await sock.sendMessage(chat, { text: "🔄 *ASURA MD: Processing Media...*" }, { quoted: msg });

        // Step 1: Download media to buffer (No file saving/download to disk)
        const stream = await downloadContentFromMessage(quoted[Object.keys(quoted)[0]], messageType.toLowerCase() === 'image' ? 'image' : messageType.toLowerCase() === 'video' ? 'video' : messageType.toLowerCase() === 'audio' ? 'audio' : 'document');
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Step 2: Conversion Logic based on Command Arguments
        
        // 1. IMAGE -> STICKER
        if (/image/.test(mime)) {
            return await sock.sendMessage(chat, { sticker: buffer }, { quoted: msg });
        }

        // 2. STICKER -> IMAGE
        if (/sticker/.test(mime)) {
            return await sock.sendMessage(chat, { image: buffer, caption: "✅ *Converted by Asura MD*" }, { quoted: msg });
        }

        // 3. VIDEO -> AUDIO / GIF / VOICE
        if (/video/.test(mime)) {
            if (args[0] === 'gif') {
                return await sock.sendMessage(chat, { video: buffer, gifPlayback: true, caption: "✅ *GIF Converted*" }, { quoted: msg });
            }
            const isVoice = args[0] === 'voice';
            return await sock.sendMessage(chat, { 
                audio: buffer, 
                mimetype: 'audio/ogg', 
                ptt: isVoice 
            }, { quoted: msg });
        }

        // 4. AUDIO -> VOICE (PTT)
        if (/audio/.test(mime)) {
            return await sock.sendMessage(chat, { 
                audio: buffer, 
                mimetype: 'audio/ogg', 
                ptt: true 
            }, { quoted: msg });
        }

        // 5. ANY MEDIA -> DOCUMENT (PDF/Doc)
        if (args[0] === 'doc' || args[0] === 'pdf') {
            return await sock.sendMessage(chat, { 
                document: buffer, 
                mimetype: args[0] === 'pdf' ? 'application/pdf' : mime, 
                fileName: `Asura_Intel_${Date.now()}.${args[0]}`
            }, { quoted: msg });
        }

        // If no specific arg, but valid media
        return sock.sendMessage(chat, { text: "⚠️ Please specify format: \nExample: .convert gif, .convert voice, .convert pdf" }, { quoted: msg });

    } catch (e) {
        console.error("Conversion Error:", e);
        await sock.sendMessage(chat, { text: "❌ Error: Failed to process media. Make sure it's a valid file." }, { quoted: msg });
    }
};
