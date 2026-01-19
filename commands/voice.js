import * as googleTTS from 'google-tts-api';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let text = args.join(' ');
    const thumbPath = './media/thumb.jpg'; 

    if (!text) return sock.sendMessage(chat, { text: "എന്തെങ്കിലും ടൈപ്പ് ചെയ്യൂ..." }, { quoted: msg });

    try {
        // --- ഹ്യൂമൻ വോയ്‌സ് ലോജിക് ---
        let processedText = text;
        if (text.length > 10) {
            processedText = text.replace(/\s+/g, ', '); 
        }
        
        if (/(എന്ത്|എവിടെ|എങ്ങനെ|ആര്|ആണോ|സുഖമാണോ)/i.test(text)) {
            processedText += '?';
        }

        // --- ലാംഗ്വേജ് ഡിറ്റക്ഷൻ ---
        let lang = 'en';
        if (/[\u0D00-\u0D7F]/.test(text)) lang = 'ml';
        else if (/[\u0B80-\u0BFF]/.test(text)) lang = 'ta';
        else if (/[\u0900-\u097F]/.test(text)) lang = 'hi';
        else if (/[\u0C00-\u0C7F]/.test(text)) lang = 'te';
        else if (/[\u0600-\u06FF]/.test(text)) lang = 'ur';
        else if (/[a-zA-Z]/.test(text)) lang = 'en';

        // Direct Stream URL (No Download)
        const url = googleTTS.getAudioUrl(processedText.slice(0, 200), {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // വോയ്‌സ് അയക്കുന്നു
        await sock.sendMessage(chat, { 
            audio: { url: url }, 
            mimetype: 'audio/ogg; codecs=opus', 
            ptt: true,
            waveform: new Uint8Array([0, 0, 100, 0, 50, 0, 100, 0, 50, 100, 0, 50, 100, 0, 100]), // Custom Waveform lines
            contextInfo: {
                externalAdReply: {
                    title: `ASURA MD AI VOICE - ${lang.toUpperCase()}`,
                    body: "Smart AI Voice Engine",
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: true,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24"
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error("Voice Error:", e);
        await sock.sendMessage(chat, { text: "Error: വോയ്‌സ് അയക്കാൻ കഴിഞ്ഞില്ല!" });
    }
};
