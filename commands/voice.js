import * as googleTTS from 'google-tts-api';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let text = args.join(' ');
    const thumbPath = './media/thumb.jpg'; 

    if (!text) return sock.sendMessage(chat, { text: ".voice hello ..." }, { quoted: msg });

    try {
     
        let lang = 'en';
        if (/[\u0D00-\u0D7F]/.test(text)) lang = 'ml';      
        else if (/[\u0B80-\u0BFF]/.test(text)) lang = 'ta'; 
        else if (/[\u0900-\u097F]/.test(text)) lang = 'hi'; 
        else if (/[\u0600-\u06FF]/.test(text)) lang = 'ar'; 

        const url = googleTTS.getAudioUrl(text, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        await sock.sendMessage(chat, { 
            audio: { url: url }, 
            mimetype: 'audio/ogg; codecs=opus'  
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: `ASURA AI VOICE - ${lang.toUpperCase()}`,
                    body: "Automatically detected your language",
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: true,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24"
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error("TTS Error:", e);
        await sock.sendMessage(chat, { text: "Error: !" });
    }
};
