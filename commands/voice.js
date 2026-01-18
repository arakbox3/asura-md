import * as googleTTS from 'google-tts-api';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    if (!args[0]) return sock.sendMessage(chat, { text: "*ഉപയോഗിക്കേണ്ട രീതി:*\n.voice [type] [text]\n\n*Types:* male, female, baby, devil\n*Example:* .voice devil സുഖമാണോ" });

    const type = args[0].toLowerCase();
    const text = args.slice(1).join(' ');
    if (!text) return sock.sendMessage(chat, { text: "വാചകം കൂടി നൽകൂ..." });

    try {
        const url = googleTTS.getAudioUrl(text, { lang: 'ml', slow: false, host: 'https://translate.google.com' });
        const tempIn = path.join('./temp_in.mp3');
        const tempOut = path.join('./temp_out.mp3');

        // ഓഡിയോ ഡൗൺലോഡ് ചെയ്യുന്നു
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(tempIn, Buffer.from(buffer));

        // FFmpeg ഉപയോഗിച്ച് ശബ്ദം മാറ്റുന്നു
        let filter = '';
        if (type === 'male') filter = 'atempo=1.0,asetrate=44100*0.9,bass=g=10'; 
        else if (type === 'female') filter = 'atempo=1.0,asetrate=44100*1.2';
        else if (type === 'baby') filter = 'atempo=1.0,asetrate=44100*1.6';
        else if (type === 'devil') filter = 'atempo=1.0,asetrate=44100*0.6,aecho=0.8:0.88:60:0.4';
        else filter = 'atempo=1.0'; // Default

        exec(`ffmpeg -i ${tempIn} -af "${filter}" ${tempOut} -y`, async (err) => {
            if (err) throw err;

            await sock.sendMessage(chat, { 
                audio: fs.readFileSync(tempOut), 
                mimetype: 'audio/mp4', 
                ptt: true 
            }, { quoted: msg });

            // ഫയലുകൾ ഡിലീറ്റ് ചെയ്യുന്നു
            if (fs.existsSync(tempIn)) fs.unlinkSync(tempIn);
            if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
        });

    } catch (e) {
        console.error(e);
        sock.sendMessage(chat, { text: "Error logic!" });
    }
};
