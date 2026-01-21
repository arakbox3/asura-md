import * as googleTTS from 'google-tts-api';
import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(' ');

    if (!text) return sock.sendMessage(chat, { text: "*Example: .voice Hello how are you*" }, { quoted: msg });

    try {
        // --- Language Detection ---
        let lang = 'en';
        if (/[\u0D00-\u0D7F]/.test(text)) lang = 'ml';      
        else if (/[\u0B80-\u0BFF]/.test(text)) lang = 'ta'; 
        else if (/[\u0900-\u097F]/.test(text)) lang = 'hi'; 

        // Google TTS URL എടുക്കുന്നു
        const results = googleTTS.getAllAudioUrls(text, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        if (results && results.length > 0) {
            const audioUrl = results[0].url;

            // --- ഡൗൺലോഡ് ചെയ്യാതെ Buffer വഴി അയക്കുന്നു ---
            const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'utf-8');

            await sock.sendMessage(chat, { 
                audio: buffer, 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, { quoted: msg });

        } else {
            throw new Error("poyi");
        }

    } catch (e) {
        console.error("TTS Error:", e);
        await sock.sendMessage(chat, { text: "Error: 😥" });
    }
};
