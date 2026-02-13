import axios from 'axios';
import ytSearch from 'yt-search';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util'; 
import ffmpegPath from 'ffmpeg-static';

const execPromise = promisify(exec);
const ffPath = ffmpegPath; 
const getAudioUrl = async (url) => {
    const headers = { 'Referer': 'https://id.ytmp3.mobi/' };
    const videoID = url.includes('youtu.be') ? url.split('/').pop() : new URL(url).searchParams.get('v');
    const { data: initData } = await axios.get(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, { headers });
    const urlParam = { v: videoID, f: 'mp3', _: Math.random() };
    const { data: convertData } = await axios.get(`${initData.convertURL}&${new URLSearchParams(urlParam)}`, { headers });
    return convertData.downloadURL;
};

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(chat, { text: "❌ .audio name/link !" }, { quoted: msg });

    const inputMp3 = `./in_${Date.now()}.mp3`;
    const outputMp3 = `./out_${Date.now()}.mp3`;
    const outputOpus = `./out_${Date.now()}.opus`;


    try {
        await sock.sendMessage(chat, { react: { text: "🎧", key: msg.key } });

        const search = await ytSearch(query);
        const video = search.videos[0];
        if (!video) throw new Error("Video not found");

        const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Audio Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *CHANNEL:* ${video.author.name}
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *DURATION:* ${video.timestamp}
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ *Sending Audio 🔊*
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

        await sock.sendMessage(chat, {
            image: { url: video.thumbnail },
            caption: infoText
        }, { quoted: msg });

        const rawAudioUrl = await getAudioUrl(video.url);
        
        // 1. ഫയൽ ഡൗൺലോഡ് ചെയ്യുന്നു
        const response = await axios.get(rawAudioUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(inputMp3, Buffer.from(response.data));

     // --- 1. SEND AUDIO FILE (Fixed) ---
try {
    
    await execPromise(`"${ffPath}" -y -i "${inputMp3}" -vn -c:a libmp3lame -q:a 4 "${outputMp3}"`);
    if (fs.existsSync(outputMp3)) {
        await sock.sendMessage(chat, {
            audio: fs.readFileSync(outputMp3),
            mimetype: 'audio/mp4', 
            ptt: false 
        }, { quoted: msg });
        fs.unlinkSync(outputMp3);
    }
} catch (err) {
    console.error("Audio conversion failed:", err);
    
    await sock.sendMessage(chat, { audio: fs.readFileSync(inputMp3), mimetype: 'audio/mpeg' }, { quoted: msg });
}

// --- 2. SEND VOICE NOTE (PTT Fixed) ---
try { 
   
    await execPromise(`"${ffPath}" -y -i "${inputMp3}" -vn -ac 1 -c:a libopus -b:a 64k -application voip -flags +global_header -ar 48000 "${outputOpus}"`);
    
    if (fs.existsSync(outputOpus)) {
        await sock.sendMessage(chat, {
            audio: fs.readFileSync(outputOpus),
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true 
        }, { quoted: msg });
        fs.unlinkSync(outputOpus);
    }
} catch (err) {
    console.error("PTT conversion failed:", err);
}

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error("Main Error:", e);
        await sock.sendMessage(chat, { text: "❌ Error: " + e.message }, { quoted: msg });
    } finally {
        if (fs.existsSync(inputMp3)) fs.unlinkSync(inputMp3);
    }

