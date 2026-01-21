import * as googleTTS from 'google-tts-api';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(' ');
    const thumbPath = './media/thumb.jpg'; 

    if (!text) return sock.sendMessage(chat, { text: "Please type something..." }, { quoted: msg });

    try {
        // - (Unlimited Support) ---
        const results = googleTTS.getAllAudioUrls(text, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });

        const audioUrl = results[0].url;

        await sock.sendMessage(chat, { 
            audio: { url: audioUrl }, 
            mimetype: 'audio/ogg; codecs=opus', 
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: "ASURA AI ENGLISH VOICE",
                    body: "Unlimited Length Support | No Download",
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
        await sock.sendMessage(chat, { text: "Error: Could not generate voice." });
    }
};
