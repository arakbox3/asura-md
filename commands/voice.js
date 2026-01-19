import * as googleTTS from 'google-tts-api';
import axios from 'axios';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let text = args.join(' ');
    const thumbPath = './media/thumb.jpg'; 

    if (!text) return sock.sendMessage(chat, { text: "*how to use* .voice text message" }, { quoted: msg });

    try {
        // 1. ഹ്യൂമൻ വോയ്‌സ് ഫീൽ നൽകാൻ കോമ (,) ചേർക്കുന്നു
        let processedText = text.length > 10 ? text.replace(/\s+/g, ', ') : text;

        // 2. ലാംഗ്വേജ് ഡിറ്റക്ഷൻ (മലയാളം, തമിഴ്, ഹിന്ദി, ഇംഗ്ലീഷ്)
        let lang = 'en';
        if (/[\u0D00-\u0D7F]/.test(text)) lang = 'ml';      // Malayalam
        else if (/[\u0B80-\u0BFF]/.test(text)) lang = 'ta'; // Tamil
        else if (/[\u0900-\u097F]/.test(text)) lang = 'hi'; // Hindi
        else if (/[a-zA-Z]/.test(text)) lang = 'en';       // English

        // 3. Google TTS URL നിർമ്മിക്കുന്നു
        const url = googleTTS.getAudioUrl(processedText.slice(0, 200), {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // 4. ഡൗൺലോഡ് ചെയ്യാതെ ലിങ്കിൽ നിന്ന് നേരിട്ട് ഡാറ്റ എടുക്കുന്നു (No Download)
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const voiceBuffer = Buffer.from(response.data, 'utf-8');

        // 5. വോയ്‌സ് മെസ്സേജ് അയക്കുന്നു
        await sock.sendMessage(chat, { 
            audio: voiceBuffer, 
            mimetype: 'audio/mp4', 
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: `ASURA AI - ${lang.toUpperCase()} VOICE`,
                    body: "Clear Human Pronunciation",
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
